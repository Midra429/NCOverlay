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

import { defineContentScript } from '#imports'
import {
  jikkyoNhkChIdMap,
  jikkyoNhkChIdMap_20231130,
  nhkJikkyoChIdMap,
  nhkJikkyoChIdMap_20231130,
} from '@midra/nco-utils/api/constants'
import { zeroPadding } from '@midra/nco-utils/common/zeroPadding'
import { normalizeAll } from '@midra/nco-utils/parse/libs/normalize/index'

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

const TITLE_PREFIX_REGEXP = /^【.+?】/
const DATE_TEXT_REGEXP = /(?<year>\d{4})年(?<month>\d{1,2})月(?<day>\d{1,2})日/
const AIR_DATE_TIME_REGEXP = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/

const ONE_MONTH_MS = 31 * 24 * 60 * 60 * 1000
const DATE_MS_20231130 = new Date('2023-11-30T23:59:59+09:00').getTime()
const NHK_JIKKYO_CH_IDS = {
  g1: 'jk1',
  e1: 'jk2',
  s1: 'jk101',
  s5: 'jk103',
} as const

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

  const currentDateTime = Date.now()

  const patcher = new NCOPatcher(vod, {
    getInfo: async (nco) => {
      const titleElem = document.querySelector<HTMLElement>(
        '#moviePlayer .pg_title_content > h1'
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

      // 読み込み済みのスロットID
      const slotDetails = await nco.state.get('slotDetails')
      const loadedIds = slotDetails?.map((v) => v.id) ?? []

      // ロード中のデータ
      const loadingSlotDetails: StateSlotDetailJikkyo[] = []

      // 番組表 (1ヶ月以内)
      if (currentDateTime - dateTime < ONE_MONTH_MS) {
        const year = date.getFullYear().toString()
        const month = zeroPadding(date.getMonth() + 1, 2)
        const day = zeroPadding(date.getDate(), 2)

        const timetable = await ncoApiProxy.nhk.timetable(
          `${year}-${month}-${day}`
        )

        logger.log('nhk.timetable', timetable)

        if (!timetable) return

        const infoId = year + month + day

        const timetableData = [
          ['g1', timetable.g1.publication],
          ['e1', timetable.e1.publication],
          ['s1', timetable.s1.publication],
          ['s5', timetable.s5.publication],
        ] as const

        for (const [key, publications] of timetableData) {
          const jkChId = NHK_JIKKYO_CH_IDS[key]

          if (!jikkyoChannelIds.includes(jkChId)) {
            continue
          }

          const matchedPublications = publications.filter(({ name }) => {
            return normalizeAll(normalizeTitle(name)) === titleNormalized
          })

          if (!matchedPublications.length) continue

          for (const publication of matchedPublications) {
            const starttime = new Date(publication.startDate).getTime()
            const endtime = new Date(publication.endDate).getTime()

            const id = `${jkChId}:${Math.floor(starttime / 1000)}-${Math.floor(endtime / 1000)}`

            if (loadedIds.includes(id)) continue

            loadingSlotDetails.push({
              type: 'jikkyo',
              id,
              status: 'loading',
              isAutoLoaded: true,
              info: {
                id: infoId,
                source: 'nhk_timetable',
                title: publication.name,
                duration: (endtime - starttime) / 1000,
                date: [starttime, endtime],
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

        const chronicle = await ncoApiProxy.nhk.chronicle(title, channelIds)

        logger.log('nhk.chronicle', chronicle)

        if (!chronicle) return

        const matchedChronicleResults = chronicle.filter((val) => {
          return (
            normalizeAll(
              normalizeTitle(`${val.title1} ${val.title2} ${val.title3}`)
            ) === titleNormalized
          )
        })

        for (const result of matchedChronicleResults) {
          const nhkChId = result.channel1 as NhkChannelId

          const jkChId = isBefore20231130
            ? nhkJikkyoChIdMap_20231130.get(nhkChId)
            : nhkJikkyoChIdMap.get(nhkChId)

          if (!jkChId || !jikkyoChannelIds.includes(jkChId)) {
            continue
          }

          const starttime = parseAirDateTime(
            result.airdate1,
            result.airtime1
          )?.getTime()
          const endtime = parseAirDateTime(
            result.airdate2,
            result.airtime2
          )?.getTime()

          if (!starttime || !endtime) continue

          const id = `${jkChId}:${Math.floor(starttime / 1000)}-${Math.floor(endtime / 1000)}`

          if (loadedIds.includes(id)) continue

          loadingSlotDetails.push({
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
              duration: (endtime - starttime) / 1000,
              date: [starttime, endtime],
              count: {
                comment: 0,
              },
            },
            markers: [],
            chapters: [],
          })
        }
      }

      // 放送日順に並び替え
      loadingSlotDetails.sort((a, b) => a.info.date[0] - b.info.date[0])

      // 再放送を除外
      if (jikkyoIgnoreRerun) {
        loadingSlotDetails.splice(1)
      }

      await nco.state.add('slotDetails', ...loadingSlotDetails)

      // コメント取得
      await nco.state.set('status', 'loading')

      // ニコニコ実況 過去ログ 取得
      const commentsJikkyo = await Promise.all(
        loadingSlotDetails.map(({ id, info }) => {
          return getJikkyoKakolog(nco.state, {
            jkChId: id.split(':')[0] as JikkyoChannelId,
            starttime: info.date[0] / 1000,
            endtime: info.date[1] / 1000,
          })
        })
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

      for (const { id } of loadingSlotDetails) {
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
