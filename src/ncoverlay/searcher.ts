import type { $Values } from 'utility-types'
import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { BuildSearchQueryArgs } from '@midra/nco-utils/search/lib/buildSearchQuery'
import type {
  NCOState,
  StateSlot,
  StateSlotDetail,
  StateSlotDetailDefault,
  StateSlotDetailUpdate,
} from './state'

import { parse } from '@midra/nco-utils/parse'
import { REGEXP_DANIME_CHAPTER } from '@midra/nco-utils/search/constants'
import { NICO_LIVE_ANIME_ROOT } from '@midra/nco-utils/api/services/nicolog/list'
import { jikkyoToSyobocalChId } from '@midra/nco-utils/api/utils/jikkyoToSyobocalChId'
import { syobocalToJikkyoChId } from '@midra/nco-utils/api/utils/syobocalToJikkyoChId'

import { logger } from '@/utils/logger'
import { getNiconicoComments } from '@/utils/api/niconico/getNiconicoComments'
import { getJikkyoKakologs } from '@/utils/api/jikkyo/getJikkyoKakologs'
import { getNicologComments } from '@/utils/api/nicolog/getNicologComments'
import { searchDataToSlotDetail } from '@/utils/api/niconico/searchDataToSlotDetail'
import { programToSlotDetail } from '@/utils/api/syobocal/programToSlotDetail'
import { detailToSlotDetail } from '@/utils/api/nicolog/detailToSlotDetail'
import { ncoSearchProxy } from '@/proxy/nco-utils/search/extension'

export interface NCOSearcherAutoLoadArgs
  extends Omit<BuildSearchQueryArgs, 'userAgent'> {
  jikkyo?: boolean
  jikkyoChannelIds?: JikkyoChannelId[]
  nicolog?: boolean
}

/**
 * NCOverlayの検索担当
 */
export class NCOSearcher {
  readonly #state: NCOState

  constructor(state: NCOState) {
    this.#state = state
  }

  async autoLoad(args: NCOSearcherAutoLoadArgs) {
    args.input = parse(args.input)

    const isAutoLoaded = true
    const {
      input: parsed,
      duration,
      targets,
      jikkyo,
      jikkyoChannelIds,
      nicolog,
    } = args

    const channelIds = jikkyoChannelIds
      ?.map(jikkyoToSyobocalChId)
      .filter((v) => v !== null)

    // 読み込み済みのスロットID
    const loadedIds =
      (await this.#state.get('slotDetails'))?.map((v) => v.id) ?? []

    const [searchResults, searchSyobocalResults, searchNicologResult] =
      await Promise.all([
        // ニコニコ動画 検索
        ncoSearchProxy.niconico({
          input: parsed,
          duration,
          targets,
          userAgent: EXT_USER_AGENT,
        }),

        // ニコニコ実況 過去ログ 検索
        jikkyo
          ? ncoSearchProxy.syobocal({
              input: parsed,
              channelIds,
              userAgent: EXT_USER_AGENT,
            })
          : null,

        // nicolog 検索
        nicolog ? ncoSearchProxy.nicolog(parsed) : null,
      ])

    const currentTime = Date.now()

    const syobocalPrograms =
      searchSyobocalResults &&
      searchSyobocalResults.programs.filter(
        (val) => new Date(val.EdTime).getTime() < currentTime
      )

    logger.log('searchResults', searchResults)
    logger.log('searchSyobocalResults', searchSyobocalResults)
    logger.log('searchNicologResult', searchNicologResult)

    // ロード中のデータ
    const loadingSlotDetails: StateSlotDetail[] = []

    // ニコニコ動画
    if (searchResults) {
      function addLoadingSlotDetails(
        type: StateSlotDetailDefault['type'],
        results: $Values<typeof searchResults>
      ) {
        for (const result of results) {
          if (!result || loadedIds.includes(result.contentId)) {
            continue
          }

          let offsetMs: number | undefined

          // オフセット調節
          if (type === 'szbh') {
            const diff = result.lengthSeconds - duration

            if (50 <= diff) {
              offsetMs = diff * -1000
            }
          }

          loadingSlotDetails.push(
            searchDataToSlotDetail(result, {
              type: type as StateSlotDetailDefault['type'],
              status: 'loading',
              offsetMs,
              isAutoLoaded,
            })
          )
        }
      }

      addLoadingSlotDetails('official', searchResults.official)
      addLoadingSlotDetails('danime', searchResults.danime)
      addLoadingSlotDetails('chapter', [searchResults.chapter[0]])
      addLoadingSlotDetails('szbh', searchResults.szbh)
    }

    // ニコニコ実況 過去ログ
    if (syobocalPrograms) {
      const slotTitle = [
        searchSyobocalResults.title.Title,
        `#${syobocalPrograms[0].Count}`,
        searchSyobocalResults.subtitle,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()

      for (const program of syobocalPrograms) {
        const starttime = new Date(program.StTime).getTime() / 1000
        const endtime = new Date(program.EdTime).getTime() / 1000

        const id = `${syobocalToJikkyoChId(program.ChID)}:${starttime}-${endtime}`

        if (loadedIds.includes(id)) continue

        loadingSlotDetails.push(
          programToSlotDetail(slotTitle, program, {
            status: 'loading',
            isAutoLoaded,
          })
        )
      }
    }

    // nicolog
    if (searchNicologResult) {
      loadingSlotDetails.push(
        detailToSlotDetail(searchNicologResult, {
          status: 'loading',
          isAutoLoaded,
        })
      )
    }

    await this.#state.add('slotDetails', ...loadingSlotDetails)

    // コメント取得
    await this.#state.set('status', 'loading')

    const jikkyoIds = loadingSlotDetails
      .filter((v) => v.type === 'jikkyo')
      .map((v) => v.id)

    const scPrograms = syobocalPrograms?.filter((program) => {
      const starttime = new Date(program.StTime).getTime() / 1000
      const endtime = new Date(program.EdTime).getTime() / 1000

      const id = `${syobocalToJikkyoChId(program.ChID)}:${starttime}-${endtime}`

      return jikkyoIds.includes(id)
    })

    const [
      commentsOfficial,
      commentsDAnime,
      commentsChapter,
      commentsSzbh,
      commentsJikkyo,
      commentsNicolog,
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
        searchResults.chapter.map((v) => ({ contentId: v.contentId }))
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
              starttime: new Date(val.StTime).getTime() / 1000,
              endtime: new Date(val.EdTime).getTime() / 1000,
            }))
          )
        : null,

      // nicolog 取得
      getNicologComments(
        loadingSlotDetails
          .filter((v) => v.type === 'file')
          .map((v) => `${NICO_LIVE_ANIME_ROOT}/${v.id}`)
      ),
    ])

    logger.log('commentsOfficial', commentsOfficial)
    logger.log('commentsDAnime', commentsDAnime)
    logger.log('commentsChapter', commentsChapter)
    logger.log('commentsSzbh', commentsSzbh)
    logger.log('commentsJikkyo', commentsJikkyo)
    logger.log('commentsNicolog', commentsNicolog)

    const loadedSlots: StateSlot[] = []
    const updateSlotDetails: StateSlotDetailUpdate[] = []

    // 公式, dアニメ, コメント専用
    if (
      commentsOfficial.length ||
      commentsDAnime.length ||
      commentsSzbh.length
    ) {
      function addLoadedSlots(
        results: $Values<typeof searchResults>,
        comments: Awaited<ReturnType<typeof getNiconicoComments>>
      ) {
        const len = comments.length

        for (let i = 0; i < len; i++) {
          const result = results[i]
          const cmt = comments[i]

          if (!cmt) continue

          const id = result.contentId
          const { data, threads, kawaiiCount } = cmt

          loadedSlots.push({ id, threads, isAutoLoaded })

          updateSlotDetails.push({
            id,
            status: 'ready',
            info: {
              count: {
                view: data.video.count.view,
                comment: data.video.count.comment,
                kawaii: kawaiiCount,
              },
              thumbnail:
                data.video.thumbnail.largeUrl ||
                data.video.thumbnail.middleUrl ||
                data.video.thumbnail.url,
            },
          })
        }
      }

      addLoadedSlots(searchResults.official, commentsOfficial)
      addLoadedSlots(searchResults.danime, commentsDAnime)
      addLoadedSlots(searchResults.szbh, commentsSzbh)
    }

    // dアニメ(分割)
    if (
      commentsChapter.length &&
      commentsChapter.every((_, idx, ary) => ary.at(idx - 1))
    ) {
      const result = searchResults!.chapter[0]
      const id = result.contentId
      const data = commentsChapter[0]!.data

      const matchSplit = result.title.match(REGEXP_DANIME_CHAPTER)
      const title = matchSplit!.groups!.title.trim()
      const chapterTitle = `${title} Chapter.1 〜 ${commentsChapter.length}`

      let tmpOffset = 0
      let totalDuration = 0
      let totalCountView = 0
      let totalCountComment = 0
      let totalCountKawaii = 0
      let mergedThreads: V1Thread[] = []

      for (const comment of commentsChapter) {
        const { data, threads, kawaiiCount } = comment!

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
        totalCountKawaii += kawaiiCount
        mergedThreads.push(...threads)
      }

      loadedSlots.push({
        id,
        threads: mergedThreads,
        isAutoLoaded,
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
            kawaii: totalCountKawaii,
          },
          thumbnail:
            data.video.thumbnail.largeUrl ||
            data.video.thumbnail.middleUrl ||
            data.video.thumbnail.url,
        },
      })
    }

    // ニコニコ実況
    if (commentsJikkyo) {
      for (const cmt of commentsJikkyo) {
        if (!cmt) continue

        const { thread, markers, kawaiiCount } = cmt

        loadedSlots.push({
          id: thread.id as string,
          threads: [thread],
          isAutoLoaded,
        })

        updateSlotDetails.push({
          id: thread.id as string,
          status: 'ready',
          markers,
          info: {
            count: {
              comment: thread.commentCount,
              kawaii: kawaiiCount,
            },
          },
        })
      }
    }

    // nicolog
    if (commentsNicolog) {
      for (const cmt of commentsNicolog) {
        if (!cmt) continue

        const { data, threads, commentCount, kawaiiCount } = cmt

        loadedSlots.push({
          id: data.id,
          threads,
          isAutoLoaded,
        })

        updateSlotDetails.push({
          id: data.id,
          status: 'ready',
          info: {
            count: {
              comment: commentCount,
              kawaii: kawaiiCount,
            },
          },
        })
      }
    }

    const slots: StateSlot[] = []

    for (const { id } of loadingSlotDetails) {
      const slot = loadedSlots.find((v) => v.id === id)
      const detail = updateSlotDetails.find((v) => v.id === id)

      if (slot && detail) {
        slots.push(slot)

        await this.#state.update('slotDetails', ['id'], detail)
      } else {
        await this.#state.remove('slotDetails', { id })
      }
    }

    await this.#state.add('slots', ...slots)

    this.#state.get('slots').then((val) => {
      logger.log('slots', val)
    })
    this.#state.get('slotDetails').then((val) => {
      logger.log('slotDetails', val)
    })
  }
}
