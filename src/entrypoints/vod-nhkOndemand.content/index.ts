import type {
  JikkyoChannelId,
  NhkChannelId,
  NhkServiceId,
} from '@midra/nco-utils/types/api/constants'
import type {
  StateSlot,
  StateSlotDetailJikkyo,
  StateSlotDetailUpdate,
} from '@/ncoverlay/state'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { compare } from '@midra/nco-utils/compare'
import { parse } from '@midra/nco-utils/parse'
import {
  jikkyoNhkChIdMap,
  jikkyoNhkChIdMap_20231130,
  nhkJikkyoChIdMap,
  nhkJikkyoChIdMap_20231130,
} from '@midra/nco-utils/api/constants'
import { zeroPadding } from '@midra/nco-utils/common/zeroPadding'
import { normalizeAll } from '@midra/nco-utils/parse/libs/normalize'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { getJikkyoKakolog } from '@/utils/api/jikkyo/getJikkyoKakolog'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'nhkOndemand'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

const TITLE_PREFIX_REGEXP = /^(?:【.+?】|連続テレビ小説\s)/
const DATE_TEXT_REGEXP = /(?<year>\d{4})年(?<month>\d{1,2})月(?<day>\d{1,2})日/
const AIR_DATE_TIME_REGEXP = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/
const EP_SHORT_REGEXP = /(（[０-９]+）)/

const ONE_MONTH_MS = 31 * 24 * 60 * 60 * 1000
const DATE_MS_20231130 = new Date('2023-11-30T23:59:59+09:00').getTime()
const NHK_SERVICE_ID_JIKKYO_CH: {
  [id in NhkServiceId]?: JikkyoChannelId
} = {
  g1: 'jk1',
  e1: 'jk2',
  s1: 'jk101',
  s5: 'jk103',
}

function cleanTitle(title: string): string {
  return title
    .replace(/\ue486|\ue488/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTitle(title: string): string {
  return cleanTitle(title).replace(TITLE_PREFIX_REGEXP, '').trim()
}

function parseDate(dateText: string): Date | null {
  const match = dateText.match(DATE_TEXT_REGEXP)

  if (!match) {
    return null
  }

  const { year, month, day } = match.groups!

  return new Date(
    `${year}-${zeroPadding(month, 2)}-${zeroPadding(day, 2)}T00:00:00+09:00`
  )
}

function parseAirDateTime(airdate: string, airtime: string): Date | null {
  const str = airdate + airtime

  if (!AIR_DATE_TIME_REGEXP.test(str)) {
    return null
  }

  return new Date(
    (airdate + airtime).replace(AIR_DATE_TIME_REGEXP, '$1-$2-$3T$4:$5:$6+09:00')
  )
}

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  const patcher = new NCOPatcher(vod, {
    getInfo: async (nco) => {
      const titleElem = document.querySelector<HTMLElement>(
        '#moviePlayer .pg_title_content h1'
      )
      const title = titleElem?.textContent

      if (!title) {
        return null
      }

      const input = normalizeTitle(title)
      const duration = nco.renderer.video.duration

      logger.log('input', input)
      logger.log('duration', duration)

      return { input, duration, disableParse: true }
    },
    autoSearch: async (nco, args) => {
      const { input, duration, targets, jikkyoChannelIds, jikkyoIgnoreRerun } =
        args

      if (
        duration < 60 ||
        !targets.includes('jikkyo') ||
        !jikkyoChannelIds?.length
      ) {
        return
      }

      // 放送日
      const dateNode =
        document.querySelector<HTMLElement>('#programInfo .date')?.firstChild
      const date = dateNode?.textContent
        ? parseDate(dateNode.textContent)
        : null

      if (!date) return

      const dateTime = date.getTime()

      const title = typeof input === 'string' ? input : input.input
      const titleNormalized = normalizeAll(title)
      const titleParsed = parse(title)

      const isConsecutiveEp =
        titleParsed.isSingleEpisode &&
        titleParsed.episode !== null &&
        // (1)
        ((titleParsed.episode.prefix === '(' &&
          titleParsed.episode.suffix === ')') ||
          // 第1回
          (titleParsed.episode.prefix.trim() === '第' &&
            titleParsed.episode.suffix === '回')) &&
        titleParsed.subtitle !== null

      // 読み込み済みのスロットID
      const slotDetails = await nco.state.get('slotDetails')
      const loadedIds = slotDetails?.map((v) => v.id) ?? []

      // ロード中のデータ
      const loadingSlotDetails: {
        [key in JikkyoChannelId]?: StateSlotDetailJikkyo[]
      } = {}

      // 番組表 (1ヶ月以内)
      if (Date.now() - dateTime < ONE_MONTH_MS) {
        const timetable = await ncoApiProxy.nhk.timetable(dateTime)

        logger.log('nhk.timetable', timetable)

        if (!timetable) return

        const infoId = [
          date.getFullYear(),
          zeroPadding(date.getMonth() + 1, 2),
          zeroPadding(date.getDate(), 2),
        ].join('-')

        const timetableData = [
          ['g1', timetable.g1.publication],
          ['e1', timetable.e1.publication],
          ['s1', timetable.s1.publication],
          ['s5', timetable.s5.publication],
        ] as const

        for (const [key, publications] of timetableData) {
          const jkChId = NHK_SERVICE_ID_JIKKYO_CH[key]

          if (!jkChId || !jikkyoChannelIds.includes(jkChId)) {
            continue
          }

          const matchedPublications = publications.filter(({ name }) => {
            const fullTitle = normalizeTitle(name)

            return isConsecutiveEp
              ? compare(fullTitle, titleParsed, { strict: true })
              : normalizeAll(fullTitle) === titleNormalized
          })

          if (!matchedPublications.length) continue

          for (const publication of matchedPublications) {
            const starttimeMs = new Date(publication.startDate).getTime()
            const endtimeMs = new Date(publication.endDate).getTime()

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
                id: infoId,
                source: 'nhk_timetable',
                title: publication.name,
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
        }
      }
      // 過去番組表
      else {
        const isBefore20231130 = dateTime <= DATE_MS_20231130

        const channelIds = jikkyoChannelIds
          .map((jkChId) => {
            return isBefore20231130
              ? jikkyoNhkChIdMap_20231130.get(jkChId)
              : jikkyoNhkChIdMap.get(jkChId)
          })
          .filter((v) => v != null)

        if (!channelIds.length) return

        const onwards = [
          date.getFullYear(),
          zeroPadding(date.getMonth() + 1, 2),
          zeroPadding(date.getDate(), 2),
        ].join('')

        const searchTitle = isConsecutiveEp
          ? [
              titleParsed.title,
              titleParsed.episode!.number,
              titleParsed.subtitleStripped,
            ].join(' ')
          : title

        const chronicle = await ncoApiProxy.nhk.chronicle(searchTitle, {
          channelIds,
          onwards,
        })

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
      const video = document.body.querySelector<HTMLVideoElement>(
        '#moviePlayer .HLS-Player .player__video[src]'
      )

      if (video) {
        patcher.setVideo(video)
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
