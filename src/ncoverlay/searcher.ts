import type { V1Thread } from '@xpadev-net/niconicomments'
import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type {
  BuildSearchQueryInput,
  BuildSearchQueryOptions,
} from '@midra/nco-api/search/lib/buildSearchQuery'
import type {
  NCOState,
  StateSlot,
  StateSlotDetail,
  StateSlotDetailUpdate,
} from './state'

import { jikkyoToSyobocalChId } from '@midra/nco-api/utils/jikkyoToSyobocalChId'
import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

import { logger } from '@/utils/logger'
import { getNiconicoComments } from '@/utils/api/getNiconicoComments'
import { getJikkyoKakologs } from '@/utils/api/getJikkyoKakologs'
import { extractNgSettings } from '@/utils/api/extractNgSettings'
import { applyNgSettings } from '@/utils/api/applyNgSetting'

import { ncoApiProxy } from '@/proxy/nco-api'

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
    options: Omit<BuildSearchQueryOptions, 'userAgent'> & {
      jikkyo?: boolean
      jikkyoChannelIds?: JikkyoChannelId[]
    } = {}
  ) {
    const { jikkyo, jikkyoChannelIds, ...searchOptions } = options

    const channelIds = jikkyoChannelIds
      ?.map(jikkyoToSyobocalChId)
      .filter((v) => v !== null)

    // 読み込み済みのスロットID
    const loadedIds =
      (await this.#state.get('slotDetails'))?.map((v) => v.id) ?? []

    const [searchResults, searchSyobocalResults] = await Promise.all([
      // ニコニコ動画 検索
      ncoApiProxy.search({
        input,
        options: {
          ...searchOptions,
          userAgent,
        },
      }),

      // ニコニコ実況 過去ログ 検索
      jikkyo
        ? ncoApiProxy.searchSyobocal(input, {
            channelIds,
            userAgent,
          })
        : null,
    ])

    const currentTime = Date.now() / 1000

    const syobocalPrograms =
      searchSyobocalResults &&
      searchSyobocalResults.programs.filter(
        (val) => parseInt(val.EdTime) < currentTime
      )

    logger.log('searchResults:', searchResults)
    logger.log('searchSyobocalResults:', searchSyobocalResults)

    // ロード中のデータ
    const loadingSlotDetails: StateSlotDetail[] = []

    // ニコニコ動画
    if (searchResults) {
      ;(
        [
          ['official', searchResults.official],
          ['danime', searchResults.danime],
          ['chapter', [searchResults.chapter[0]]],
          ['szbh', searchResults.szbh],
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
              tags: result.tags?.split(' ') ?? [],
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
      commentsOfficial,
      commentsDAnime,
      commentsChapter,
      commentsSzbh,
      commentsJikkyo,
    ] = await Promise.all([
      // ニコニコ動画 コメント 取得
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'official')
          .map((v) => ({ contentId: v.id }))
      ),
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'danime')
          .map((v) => ({ contentId: v.id }))
      ),
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'chapter')
          .map((v) => ({ contentId: v.id }))
      ),
      getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'szbh')
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

    logger.log('commentsOfficial:', commentsOfficial)
    logger.log('commentsDAnime:', commentsDAnime)
    logger.log('commentsChapter:', commentsChapter)
    logger.log('commentsSzbh:', commentsSzbh)
    logger.log('commentsJikkyo:', commentsJikkyo)

    const loadedSlots: StateSlot[] = []
    const updateSlotDetails: StateSlotDetailUpdate[] = []

    // 公式, dアニメ, コメント専用
    if (
      commentsOfficial.length ||
      commentsDAnime.length ||
      commentsSzbh.length
    ) {
      ;(
        [
          [searchResults!.official, commentsOfficial],
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
      logger.log('slots:', slots)
      logger.log('slotDetails:', slotDetails)
    })
  }
}
