import type {
  JikkyoChannelId,
  NhkChannelId,
} from '@midra/nco-utils/types/api/constants'
import type {
  StateSlot,
  StateSlotDetailJikkyo,
  StateSlotDetailUpdate,
} from '@/ncoverlay/state'
import type { VodKey } from '@/types/constants'
import type { VideoChapter } from '@/utils/api/jikkyo/findChapters'

import { defineContentScript } from '#imports'
import { compare } from '@midra/nco-utils/compare'
import { parse } from '@midra/nco-utils/parse'
import {
  jikkyoNhkChIdMap,
  jikkyoNhkChIdMap_20231130,
  nhkJikkyoChIdMap,
  nhkJikkyoChIdMap_20231130,
} from '@midra/nco-utils/api/constants'
import { normalizeAll } from '@midra/nco-utils/parse/libs/normalize'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import {
  EP_SHORT_REGEXP,
  cleanTitle,
  normalizeTitle,
  parseAirDateTime,
} from '@/utils/nhkOndemand'
import { getJikkyoKakolog } from '@/utils/api/jikkyo/getJikkyoKakolog'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { sendPageMessage } from '@/messaging/page'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'unext'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

const THUMB_PATH_YEAR_REGEXP = /(?<=\/NOD\/N\/N)\d{4}(?=\d+)/

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  let year: number | null = null

  const patcher = new NCOPatcher(vod, {
    getInfo: async () => {
      year = null

      const playbackInfo = await sendPageMessage(
        'page:unext:getPlaybackInfo',
        null
      )

      logger.log('getPlaybackInfo', playbackInfo)

      if (!playbackInfo) {
        return null
      }

      const { titleStage, titleEpisodes, positionList } = playbackInfo

      const episodeId = titleStage.episode.id
      const episode = titleEpisodes.find((v) => v.id === episodeId)

      if (!episode) {
        return null
      }

      const workTitle = titleStage.titleName
      const episodeTitle = episode.displayNo
        ? `${episode.displayNo} ${episode.episodeName}`
        : null

      const duration = episode.duration

      let chapters: VideoChapter[] = []

      if (positionList.length) {
        const opening = positionList.find((v) => v.type === 'OPENING')
        const ending = positionList.find((v) => v.type === 'ENDING')

        let avantChapter: VideoChapter | undefined
        let opChapter: VideoChapter | undefined
        let mainChapter: VideoChapter | undefined
        let edChapter: VideoChapter | undefined

        // アバン, OP
        if (opening) {
          const startMs = opening.fromSeconds * 1000
          const endMs = opening.endSeconds * 1000

          opChapter = {
            type: 'op',
            startMs,
            endMs,
            duration: endMs - startMs,
          }

          if (0 < opChapter.startMs) {
            avantChapter = {
              type: 'avant',
              startMs: 0,
              endMs: opChapter.startMs,
              duration: opChapter.startMs,
            }
          }
        }

        // ED
        if (ending) {
          const startMs = ending.fromSeconds * 1000
          const endMs = ending.endSeconds * 1000

          edChapter = {
            type: 'ed',
            startMs,
            endMs,
            duration: endMs - startMs,
          }
        }

        if (opChapter || edChapter) {
          const startMs = opChapter?.endMs ?? 0
          const endMs = edChapter?.startMs ?? duration * 1000

          mainChapter = {
            type: 'main',
            startMs,
            endMs,
            duration: endMs - startMs,
          }
        }

        chapters = [avantChapter, opChapter, mainChapter, edChapter]
          .filter((v) => v != null)
          .sort((a, b) => a.startMs - b.startMs)
      }

      const isNhkOndemand =
        episode.thumbnail.standard.includes('/img/info/NOD/')

      const yearStr = episode.thumbnail.standard.match(
        THUMB_PATH_YEAR_REGEXP
      )?.[0]

      year = yearStr ? Number(yearStr) : null

      logger.log('workTitle', workTitle)
      logger.log('episodeTitle', episodeTitle)
      logger.log('duration', duration)
      logger.log('chapters', chapters)
      logger.log('isNhkOndemand', isNhkOndemand)

      return workTitle
        ? {
            input: `${workTitle} ${episodeTitle ?? ''}`,
            duration,
            chapters,
            isNhkOndemand,
          }
        : null
    },
    autoSearch: async (nco, args) => {
      if (!args.isNhkOndemand || !year) {
        return nco.searcher.autoSearch(args)
      }

      const { input, duration, targets, jikkyoChannelIds, jikkyoIgnoreRerun } =
        args

      if (
        duration < 60 ||
        !targets.includes('jikkyo') ||
        !jikkyoChannelIds?.length
      ) {
        return
      }

      const title = typeof input === 'string' ? input : input.input
      const titleNormalized = normalizeAll(title)
      const titleParsed = parse(title)

      logger.log('titleParsed', titleParsed)

      const isConsecutiveEp =
        titleParsed.isSingleEpisode &&
        titleParsed.episode !== null &&
        // (1)
        ((titleParsed.episode.prefix === '(' &&
          titleParsed.episode.suffix === ')') ||
          // 第1回, 2回
          ((!titleParsed.episode.prefix ||
            titleParsed.episode.prefix.trim() === '第') &&
            titleParsed.episode.suffix === '回')) &&
        titleParsed.subtitle !== null

      // 読み込み済みのスロットID
      const slotDetails = await nco.state.get('slotDetails')
      const loadedIds = slotDetails?.map((v) => v.id) ?? []

      // ロード中のデータ
      const loadingSlotDetails: {
        [key in JikkyoChannelId]?: StateSlotDetailJikkyo[]
      } = {}

      // 過去番組表
      const isBefore20231130 = year <= 2023

      const channelIds = jikkyoChannelIds
        .map((jkChId) => {
          return isBefore20231130
            ? jikkyoNhkChIdMap_20231130.get(jkChId)
            : jikkyoNhkChIdMap.get(jkChId)
        })
        .filter((v) => v != null)

      if (!channelIds.length) return

      const onwards = `${year}0101`

      const searchTitle = isConsecutiveEp
        ? [
            titleParsed.title,
            titleParsed.episode!.number,
            titleParsed.subtitle,
          ].join(' ')
        : title

      let chronicle = await ncoApiProxy.nhk.chronicle(searchTitle, {
        channelIds,
      })

      if (
        !chronicle &&
        isConsecutiveEp &&
        titleParsed.subtitle !== titleParsed.subtitleStripped
      ) {
        const searchTitleStripped = [
          titleParsed.title,
          titleParsed.episode!.number,
          titleParsed.subtitleStripped,
        ].join(' ')

        chronicle = await ncoApiProxy.nhk.chronicle(searchTitleStripped, {
          channelIds,
          onwards,
        })
      }

      logger.log('nhk.chronicle', chronicle)

      if (!chronicle) return

      const matchedChronicleResults = chronicle.filter((val) => {
        const fullTitle = normalizeTitle(
          `${val.title1} ${val.title2} ${val.title3}`
        ).replace(EP_SHORT_REGEXP, ' $1 ')

        return isConsecutiveEp
          ? compare(fullTitle, titleParsed, { strict: true })
          : normalizeAll(fullTitle) === titleNormalized
      })

      for (const result of matchedChronicleResults) {
        const nhkChId = result.channel1 as NhkChannelId

        const jkChId = isBefore20231130
          ? nhkJikkyoChIdMap_20231130.get(nhkChId)
          : nhkJikkyoChIdMap.get(nhkChId)

        if (!jkChId || !jikkyoChannelIds.includes(jkChId)) {
          continue
        }

        const starttimeMs = parseAirDateTime(
          result.airdate1,
          result.airtime1
        )?.getTime()
        const endtimeMs = parseAirDateTime(
          result.airdate2,
          result.airtime2
        )?.getTime()

        if (!starttimeMs || !endtimeMs) continue

        const starttime = Math.floor(starttimeMs / 1000)
        const endtime = Math.floor(endtimeMs / 1000)

        const id = `${jkChId}:${starttime}-${endtime}` as const

        if (loadedIds.includes(id)) continue

        loadingSlotDetails[jkChId] ??= []
        loadingSlotDetails[jkChId].push({
          type: 'jikkyo',
          id,
          status: 'loading',
          isAutoLoaded: true,
          info: {
            id: result.crnId,
            source: 'nhk_chronicle',
            title: cleanTitle(
              `${result.title1} ${result.title2} ${result.title3}`
            ),
            duration: endtime - starttime,
            date: [starttimeMs, endtimeMs],
            count: {
              comment: 0,
            },
          },
          markers: [],
          chapters: [],
        })
      }

      for (const jkChId in loadingSlotDetails) {
        const slotDetails = loadingSlotDetails[jkChId as JikkyoChannelId]!

        // 放送日順に並び替え
        slotDetails.sort((a, b) => a.info.date[0] - b.info.date[0])

        // 再放送を除外
        if (jikkyoIgnoreRerun) {
          slotDetails.splice(1)
        }
      }

      const loadingSlotDetailsArray = Object.values(loadingSlotDetails).flatMap(
        (v) => [...v.values()]
      )

      await nco.state.add('slotDetails', ...loadingSlotDetailsArray)

      // コメント取得
      await nco.state.set('status', 'loading')

      // ニコニコ実況 過去ログ 取得
      const commentsJikkyo = await Promise.all(
        loadingSlotDetailsArray.map((v) => getJikkyoKakolog(nco.state, v.id))
      )

      logger.log('commentsJikkyo', commentsJikkyo)

      const loadedSlotMap = new Map<string, StateSlot>()
      const updateSlotDetailMap = new Map<string, StateSlotDetailUpdate>()

      // ニコニコ実況
      for (const cmt of commentsJikkyo) {
        if (!cmt) continue

        const { thread, markers, chapters, kawaiiCount } = cmt
        const id = thread.id

        loadedSlotMap.set(id, {
          id,
          threads: [thread],
          isAutoLoaded: true,
        })

        updateSlotDetailMap.set(id, {
          id,
          status: 'ready',
          info: {
            count: {
              comment: thread.commentCount,
              kawaii: kawaiiCount,
            },
          },
          markers,
          chapters,
        })
      }

      const slots: StateSlot[] = []

      for (const { id } of loadingSlotDetailsArray) {
        const slot = loadedSlotMap.get(id)
        const detail = updateSlotDetailMap.get(id)

        if (slot && detail) {
          slots.push(slot)

          await nco.state.update('slotDetails', ['id'], detail)
        } else {
          await nco.state.remove('slotDetails', { id })
        }
      }

      await nco.state.add('slots', ...slots)

      nco.state.get('slots').then((val) => {
        logger.log('slots', val)
      })
      nco.state.get('slotDetails').then((val) => {
        logger.log('slotDetails', val)
      })
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (patcher.nco) {
      if (!patcher.nco.renderer.video.checkVisibility()) {
        patcher.dispose()
      }
    } else {
      if (location.pathname.startsWith('/play/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          ':is(#videoTagWrapper, div[data-ucn="fullscreenContextWrapper"]) video:is([src], :has(source[src]))'
        )

        if (video) {
          patcher.setVideo(video)
        }
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
