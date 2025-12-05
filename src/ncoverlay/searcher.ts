import type { ParsedResult } from '@midra/nco-utils/parse'
import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { SearchDataWithFields } from '@midra/nco-utils/search/services/niconico'
import type { AutoSearchTarget } from '@/types/storage'
import type { GetNiconicoCommentResult } from '@/utils/api/niconico/getNiconicoComment'
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
import {
  jikkyoSyobocalChIdMap,
  syobocalJikkyoChIdMap,
} from '@midra/nco-utils/api/constants'

import { logger } from '@/utils/logger'
import { getNiconicoComment } from '@/utils/api/niconico/getNiconicoComment'
import { getJikkyoKakolog } from '@/utils/api/jikkyo/getJikkyoKakolog'
import { getNicologComment } from '@/utils/api/nicolog/getNicologComment'
import { searchDataToSlotDetail } from '@/utils/api/niconico/searchDataToSlotDetail'
import {
  convertProgramTime,
  getSlotIdFromProgram,
  programToSlotDetail,
} from '@/utils/api/syobocal/programToSlotDetail'
import { detailToSlotDetail } from '@/utils/api/nicolog/detailToSlotDetail'
import { ncoSearchProxy } from '@/proxy/nco-utils/search/extension'

export interface NCOSearcherAutoSearchArgs {
  /** 動画タイトル or 解析結果 */
  input: string | ParsedResult
  /** 動画の長さ */
  duration: number
  /** 検索対象 */
  targets: AutoSearchTarget[]
  /** 実況チャンネル */
  jikkyoChannelIds?: JikkyoChannelId[]
}

/**
 * NCOverlayの検索担当
 */
export class NCOSearcher {
  readonly #state: NCOState

  constructor(state: NCOState) {
    this.#state = state
  }

  async autoSearch(args: NCOSearcherAutoSearchArgs) {
    args.input = parse(args.input)

    const isAutoLoaded = true
    const { input, duration, targets, jikkyoChannelIds } = args

    const channelIds = jikkyoChannelIds
      ?.map((jkId) => jikkyoSyobocalChIdMap.get(jkId))
      .filter((scId) => scId != null)

    // 読み込み済みのスロットID
    const slotDetails = await this.#state.get('slotDetails')
    const loadedIds = slotDetails?.map((v) => v.id) ?? []

    const [searchNiconicoResults, searchSyobocalResults, searchNicologResult] =
      await Promise.all([
        // ニコニコ動画 検索
        ncoSearchProxy.niconico({
          input,
          duration,
          targets: {
            official: targets.includes('official'),
            danime: targets.includes('danime'),
            chapter: targets.includes('chapter'),
            szbh: targets.includes('szbh'),
          },
          userAgent: EXT_USER_AGENT,
        }),

        // ニコニコ実況 過去ログ 検索
        targets.includes('jikkyo')
          ? ncoSearchProxy.syobocal({
              input,
              channelIds,
              userAgent: EXT_USER_AGENT,
            })
          : null,

        // nicolog 検索
        targets.includes('nicolog') ? ncoSearchProxy.nicolog(input) : null,
      ])

    logger.log('searchNiconicoResults', searchNiconicoResults)
    logger.log('searchSyobocalResults', searchSyobocalResults)
    logger.log('searchNicologResult', searchNicologResult)

    const currentTime = Date.now()

    const syobocalPrograms =
      searchSyobocalResults?.programs.filter(
        (val) => new Date(val.EdTime).getTime() < currentTime
      ) ?? []

    // ロード中のデータ
    const loadingSlotDetails: Record<
      AutoSearchTarget,
      Map<string, StateSlotDetail>
    > = {
      official: new Map(),
      danime: new Map(),
      chapter: new Map(),
      szbh: new Map(),
      jikkyo: new Map(),
      nicolog: new Map(),
    }

    // ニコニコ動画
    function addLoadingSlotDetails(
      type: Exclude<StateSlotDetailDefault['type'], 'normal'>,
      results: SearchDataWithFields[]
    ) {
      for (const data of results) {
        if (loadedIds.includes(data.contentId)) continue

        let offsetMs: number | undefined

        // オフセット調節
        if (type === 'szbh') {
          const diff = data.lengthSeconds - duration

          if (50 <= diff) {
            offsetMs = diff * -1000
          }
        }

        const slotDetail = searchDataToSlotDetail(data, {
          type,
          status: 'loading',
          offsetMs,
          isAutoLoaded,
        })

        loadingSlotDetails[type].set(slotDetail.id, slotDetail)
      }
    }

    addLoadingSlotDetails('official', searchNiconicoResults.official)
    addLoadingSlotDetails('danime', searchNiconicoResults.danime)
    addLoadingSlotDetails('chapter', searchNiconicoResults.chapter.slice(0, 1))
    addLoadingSlotDetails('szbh', searchNiconicoResults.szbh)

    // ニコニコ実況 過去ログ
    if (searchSyobocalResults && syobocalPrograms.length) {
      const slotTitle = [
        searchSyobocalResults.title.Title,
        `#${syobocalPrograms[0].Count}`,
        searchSyobocalResults.subtitle,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()

      for (const program of syobocalPrograms) {
        const slotDetail = programToSlotDetail(slotTitle, program, {
          status: 'loading',
          isAutoLoaded,
        })

        if (loadedIds.includes(slotDetail.id)) continue

        loadingSlotDetails.jikkyo.set(slotDetail.id, slotDetail)
      }
    }

    // nicolog
    if (searchNicologResult && !loadedIds.includes(searchNicologResult.id)) {
      const slotDetail = detailToSlotDetail(searchNicologResult, {
        status: 'loading',
        isAutoLoaded,
      })

      loadingSlotDetails.nicolog.set(slotDetail.id, slotDetail)
    }

    const loadingSlotDetailsArray = Object.values(loadingSlotDetails).flatMap(
      (v) => v.values().toArray()
    )

    await this.#state.add('slotDetails', ...loadingSlotDetailsArray)

    // コメント取得
    await this.#state.set('status', 'loading')

    const jikkyoIds = loadingSlotDetails.jikkyo
      .values()
      .toArray()
      .map((v) => v.id)

    const scPrograms = syobocalPrograms.filter((prog) => {
      return jikkyoIds.includes(getSlotIdFromProgram(prog))
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
      Promise.all(
        loadingSlotDetails.official.values().map((detail) => {
          return getNiconicoComment(detail.id)
        })
      ),
      Promise.all(
        loadingSlotDetails.danime.values().map((detail) => {
          return getNiconicoComment(detail.id)
        })
      ),
      Promise.all(
        searchNiconicoResults.chapter.map((data) => {
          return getNiconicoComment(data.contentId)
        })
      ),
      Promise.all(
        loadingSlotDetails.szbh.values().map((detail) => {
          return getNiconicoComment(detail.id)
        })
      ),

      // ニコニコ実況 過去ログ 取得
      Promise.all(
        scPrograms.map((prog) => {
          return getJikkyoKakolog({
            jkChId: syobocalJikkyoChIdMap.get(prog.ChID)!,
            starttime: convertProgramTime(prog.StTime) / 1000,
            endtime: convertProgramTime(prog.EdTime) / 1000,
          })
        })
      ),

      // nicolog 取得
      Promise.all(
        loadingSlotDetails.nicolog.values().map((detail) => {
          return getNicologComment(`${NICO_LIVE_ANIME_ROOT}/${detail.id}`)
        })
      ),
    ])

    logger.log('commentsOfficial', commentsOfficial)
    logger.log('commentsDAnime', commentsDAnime)
    logger.log('commentsChapter', commentsChapter)
    logger.log('commentsSzbh', commentsSzbh)
    logger.log('commentsJikkyo', commentsJikkyo)
    logger.log('commentsNicolog', commentsNicolog)

    const loadedSlotMap = new Map<string, StateSlot>()
    const updateSlotDetailMap = new Map<string, StateSlotDetailUpdate>()

    // 公式, dアニメ, コメント専用
    function addLoadedSlots(
      results: SearchDataWithFields[],
      comments: (GetNiconicoCommentResult | null)[]
    ) {
      const len = results.length

      for (let i = 0; i < len; i++) {
        const cmt = comments[i]

        if (!cmt) continue

        const { contentId: id } = results[i]

        const {
          videoData: { video },
          threads,
          kawaiiCount,
        } = cmt

        loadedSlotMap.set(id, {
          id,
          threads,
          isAutoLoaded,
        })

        updateSlotDetailMap.set(id, {
          id,
          status: 'ready',
          info: {
            count: {
              view: video.count.view,
              comment: video.count.comment,
              kawaii: kawaiiCount,
            },
            thumbnail:
              video.thumbnail.largeUrl ||
              video.thumbnail.middleUrl ||
              video.thumbnail.url,
          },
        })
      }
    }

    addLoadedSlots(searchNiconicoResults.official, commentsOfficial)
    addLoadedSlots(searchNiconicoResults.danime, commentsDAnime)
    addLoadedSlots(searchNiconicoResults.szbh, commentsSzbh)

    // dアニメ(分割)
    if (commentsChapter.length && commentsChapter.every((v) => v !== null)) {
      const result = searchNiconicoResults.chapter[0]
      const id = result.contentId
      const {
        video: { thumbnail },
      } = commentsChapter[0].videoData

      const { groups } = result.title.match(REGEXP_DANIME_CHAPTER)!
      const title = groups!.title.trim()
      const chapterTitle = `${title} Chapter.1 〜 ${commentsChapter.length}`

      let tmpOffset = 0
      let totalDuration = 0
      let totalCountView = 0
      let totalCountComment = 0
      let totalCountKawaii = 0
      let mergedThreads: V1Thread[] = []

      for (const comment of commentsChapter) {
        const {
          videoData: { video },
          threads,
          kawaiiCount,
        } = comment

        if (tmpOffset) {
          for (const thread of threads) {
            for (const comment of thread.comments) {
              comment.vposMs += tmpOffset
            }
          }
        }

        tmpOffset += video.duration * 1000
        totalDuration += video.duration
        totalCountView += video.count.view
        totalCountComment += video.count.comment
        totalCountKawaii += kawaiiCount
        mergedThreads.push(...threads)
      }

      loadedSlotMap.set(id, {
        id,
        threads: mergedThreads,
        isAutoLoaded,
      })

      updateSlotDetailMap.set(id, {
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
          thumbnail: thumbnail.largeUrl || thumbnail.middleUrl || thumbnail.url,
        },
      })
    }

    // ニコニコ実況
    for (const cmt of commentsJikkyo) {
      if (!cmt) continue

      const { thread, markers, kawaiiCount } = cmt
      const id = thread.id

      loadedSlotMap.set(id, {
        id,
        threads: [thread],
        isAutoLoaded,
      })

      updateSlotDetailMap.set(id, {
        id,
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

    // nicolog
    for (const cmt of commentsNicolog) {
      if (!cmt) continue

      const {
        detail: { id },
        threads,
        commentCount,
        kawaiiCount,
      } = cmt

      loadedSlotMap.set(id, {
        id,
        threads,
        isAutoLoaded,
      })

      updateSlotDetailMap.set(id, {
        id,
        status: 'ready',
        info: {
          count: {
            comment: commentCount,
            kawaii: kawaiiCount,
          },
        },
      })
    }

    const slots: StateSlot[] = []

    for (const { id } of loadingSlotDetailsArray) {
      const slot = loadedSlotMap.get(id)
      const detail = updateSlotDetailMap.get(id)

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
