import type { V1Thread } from '@xpadev-net/niconicomments'
import type { BuildSearchQueryInput } from '@midra/nco-api/search/lib/buildSearchQuery'
import type {
  NCOState,
  StateSlot,
  StateSlotDetail,
  StateSlotDetailUpdate,
} from './state'

import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

import { Logger } from '@/utils/logger'
import { getNiconicoComments } from '@/utils/api/getNiconicoComments'
import { getJikkyoKakologs } from '@/utils/api/getJikkyoKakologs'
import { extractNgSettings } from '@/utils/api/extractNgSettings'
import { applyNgSettings } from '@/utils/api/applyNgSetting'

import { ncoApiProxy } from '@/proxy/nco-api'

export type AutoLoadInput = {
  rawText: string
  title?: string | null
  seasonText?: string | null
  seasonNumber?: number | null
  episodeText?: string | null
  episodeNumber?: number | null
  subtitle?: string | null
  duration: number
}

const userAgent = EXT_USER_AGENT

/**
 * NCOverlayの検索担当
 */
export class NCOSearcher {
  readonly #state: NCOState

  constructor(state: NCOState) {
    this.#state = state
  }

  async autoLoad(
    input: BuildSearchQueryInput,
    options: {
      normal?: boolean
      szbh?: boolean
      chapter?: boolean
      jikkyo?: boolean
    } = {}
  ) {
    // 読み込み済みのスロットID
    const loadedIds =
      (await this.#state.get('slotDetails'))?.map((v) => v.id) ?? []

    const [searchResults, searchSyobocalResults] = await Promise.all([
      // ニコニコ動画 検索
      ncoApiProxy.search({
        input,
        options: {
          ...options,
          userAgent,
        },
      }),

      // ニコニコ実況 過去ログ 検索
      options.jikkyo ? ncoApiProxy.searchSyobocal(input, { userAgent }) : null,
    ])

    const currentTime = Date.now() / 1000

    const syobocalPrograms =
      searchSyobocalResults &&
      searchSyobocalResults.programs.filter(
        (val) => parseInt(val.EdTime) < currentTime
      )

    Logger.log('searchResults:', searchResults)
    Logger.log('searchSyobocalResults:', searchSyobocalResults)

    // ロード中のデータ
    const loadingSlotDetails: StateSlotDetail[] = []

    // ニコニコ動画
    if (searchResults) {
      ;(
        [
          ['normal', searchResults.normal],
          ['danime', searchResults.danime],
          ['szbh', searchResults.szbh],
          ['chapter', [searchResults.chapter[0]]],
        ] as const
      ).forEach(([type, results]) => {
        results.forEach((result) => {
          if (!result || loadedIds.includes(result.contentId)) return

          let offsetMs: number | undefined

          // オフセット調節
          if (type === 'szbh') {
            const diff = result.lengthSeconds - input.duration

            if (58 <= diff) {
              offsetMs = diff * -1000
            }
          }

          loadingSlotDetails.push({
            type,
            id: result.contentId,
            status: 'loading',
            offsetMs,
            info: {
              id: result.contentId,
              title: result.title,
              duration: result.lengthSeconds,
              date: new Date(result.startTime).getTime(),
              count: {
                view: result.viewCounter,
                comment: result.commentCounter,
              },
              thumbnail: result.thumbnailUrl,
            },
          })
        })
      })
    }

    // ニコニコ実況 過去ログ
    if (syobocalPrograms) {
      const title = [
        searchSyobocalResults.title.Title,
        `#${input.episodeNumber}`,
        searchSyobocalResults.subtitle ?? '',
      ]
        .join(' ')
        .trim()

      syobocalPrograms.forEach((program) => {
        const id = `${syobocalToJikkyoChId(program.ChID)}:${program.StTime}-${program.EdTime}`

        if (loadedIds.includes(id)) return

        const starttime = parseInt(program.StTime) * 1000
        const endtime = parseInt(program.EdTime) * 1000

        loadingSlotDetails.push({
          type: 'jikkyo',
          id,
          status: 'loading',
          info: {
            id: program.TID,
            title,
            duration: (endtime - starttime) / 1000,
            date: [starttime, endtime],
            count: {
              comment: 0,
            },
          },
        })
      })
    }

    await this.#state.add('slotDetails', ...loadingSlotDetails)

    // コメント取得
    await this.#state.set('status', 'loading')

    const jikkyoIds = loadingSlotDetails
      .filter((v) => v.type === 'jikkyo')
      .map((v) => v.id)

    const scPrograms = syobocalPrograms?.filter((program) => {
      return jikkyoIds.includes(
        `${syobocalToJikkyoChId(program.ChID)}:${program.StTime}-${program.EdTime}`
      )
    })

    const [
      commentsNormal,
      commentsDAnime,
      commentsSzbh,
      commentsChapter,
      commentsJikkyo,
    ] = await Promise.all([
      // ニコニコ動画 コメント 取得
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'normal')
          .map((v) => ({ contentId: v.id }))
      ),
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'danime')
          .map((v) => ({ contentId: v.id }))
      ),
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'szbh')
          .map((v) => ({ contentId: v.id }))
      ),
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'chapter')
          .map((v) => ({ contentId: v.id }))
      ),

      // ニコニコ実況 過去ログ 取得
      scPrograms
        ? getJikkyoKakologs(
            scPrograms.map((val) => ({
              jkChId: syobocalToJikkyoChId(val.ChID)!,
              starttime: parseInt(val.StTime),
              endtime: parseInt(val.EdTime),
            }))
          )
        : null,
    ])

    Logger.log('commentsNormal:', commentsNormal)
    Logger.log('commentsDAnime:', commentsDAnime)
    Logger.log('commentsSzbh:', commentsSzbh)
    Logger.log('commentsChapter:', commentsChapter)
    Logger.log('commentsJikkyo:', commentsJikkyo)

    const loadedSlots: StateSlot[] = []
    const updateSlotDetails: StateSlotDetailUpdate[] = []

    // 通常 / dアニメ, コメント専用動画
    if (commentsNormal.length || commentsDAnime.length || commentsSzbh.length) {
      ;(
        [
          [searchResults!.normal, commentsNormal],
          [searchResults!.danime, commentsDAnime],
          [searchResults!.szbh, commentsSzbh],
        ] as const
      ).forEach(([results, comments]) => {
        comments?.forEach((cmt, idx) => {
          if (!cmt) return

          const id = results[idx].contentId
          const { data, threads } = cmt

          const applied = applyNgSettings(
            threads,
            extractNgSettings(data.comment.ng)
          )

          loadedSlots.push({
            id,
            threads: applied,
          })

          updateSlotDetails.push({
            id,
            status: 'ready',
            info: {
              count: {
                view: data.video.count.view,
                comment: data.video.count.comment,
              },
              thumbnail:
                data.video.thumbnail.largeUrl ||
                data.video.thumbnail.middleUrl ||
                data.video.thumbnail.url,
            },
          })
        })
      })
    }

    // dアニメ(分割)
    if (
      commentsChapter.length &&
      commentsChapter.every((_, idx, ary) => ary.at(idx - 1))
    ) {
      const result = searchResults!.chapter[0]
      const id = result.contentId
      const data = commentsChapter[0]!.data

      const matchSplit = result.title.match(
        /^(?<title>.+)Chapter\.(?<chapter>[1-9])$/
      )
      const title = matchSplit!.groups!.title.trim()
      const chapterTitle = `${title} Chapter.1 〜 ${commentsChapter.length}`

      let tmpOffset = 0
      let totalDuration = 0
      let totalCountView = 0
      let totalCountComment = 0
      let mergedThreads: V1Thread[] = []

      for (const comment of commentsChapter) {
        const { data, threads } = comment!

        if (tmpOffset) {
          for (const thread of threads) {
            for (const comment of thread.comments) {
              comment.vposMs += tmpOffset
            }
          }
        }

        tmpOffset += data.video.duration * 1000
        totalDuration += data.video.duration
        totalCountView += data.video.count.view
        totalCountComment += data.video.count.comment
        mergedThreads.push(...threads)
      }

      loadedSlots.push({
        id,
        threads: mergedThreads,
      })

      updateSlotDetails.push({
        id,
        status: 'ready',
        info: {
          title: chapterTitle,
          duration: totalDuration,
          count: {
            view: totalCountView,
            comment: totalCountComment,
          },
          thumbnail:
            data.video.thumbnail.largeUrl ||
            data.video.thumbnail.middleUrl ||
            data.video.thumbnail.url,
        },
      })
    }

    // ニコニコ実況
    commentsJikkyo?.forEach((cmt) => {
      if (!cmt) return

      const { thread, markers } = cmt

      loadedSlots.push({
        id: thread.id as string,
        threads: [thread],
      })

      updateSlotDetails.push({
        id: thread.id as string,
        status: 'ready',
        markers,
        info: {
          count: {
            comment: thread.commentCount,
          },
        },
      })
    })

    const slots: StateSlot[] = []

    for (const { id } of loadingSlotDetails) {
      const slot = loadedSlots.find((v) => v.id === id)
      const detail = updateSlotDetails.find((v) => v.id === id)

      if (slot && detail?.info?.count?.comment) {
        slots.push(slot)

        await this.#state.update('slotDetails', ['id'], detail)
      } else {
        await this.#state.remove('slotDetails', { id })
      }
    }

    await this.#state.add('slots', ...slots)

    Promise.all([
      this.#state.get('slots'),
      this.#state.get('slotDetails'),
    ]).then(([slots, slotDetails]) => {
      Logger.log('slots:', slots)
      Logger.log('slotDetails:', slotDetails)
    })
  }
}
