import type { DeepPartial } from 'utility-types'
import type { V1Thread } from '@xpadev-net/niconicomments'
import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { VideoData } from '@midra/nco-api/types/niconico/video'
import type { Status, Slot, NCOState, SlotUpdate } from './state'

import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

import { MARKERS } from '@/constants'

import { Logger } from '@/utils/logger'

import { ncoApiProxy } from './api'

export type NCOSearcherEventMap = {
  searching: () => void
  searched: () => void
  loading: () => void
  loaded: () => void
  ready: () => void
  error: () => void
}

/**
 * NCOverlayの検索担当
 */
export class NCOSearcher {
  readonly state: NCOState

  constructor(state: NCOState) {
    this.state = state
  }

  async autoLoad(
    info: {
      title: string
      duration: number
    },
    options: {
      szbh?: boolean
      jikkyo?: boolean
    } = {}
  ) {
    // 検索
    this.#trigger('searching')

    const [searchResult, searchSyobocalResult] = await Promise.all([
      // // ニコニコ動画 検索
      // ncoApiProxy.search({
      //   title: info.title,
      //   duration: info.duration,
      //   chapter: true,
      //   szbh: options.szbh,
      //   userAgent: EXT_USER_AGENT,
      // }),

      // ニコニコが死んでるので
      null,

      // ニコニコ実況 過去ログ 検索
      options.jikkyo
        ? ncoApiProxy.searchSyobocal({
            title: info.title,
            userAgent: EXT_USER_AGENT,
          })
        : null,
    ])

    const currentTime = Date.now() / 1000

    const syobocalPrograms =
      searchSyobocalResult &&
      searchSyobocalResult.programs.filter(
        (val) => parseInt(val.EdTime) < currentTime
      )

    this.#trigger('searched')

    // Logger.log('searchResult', searchResult)
    Logger.log('searchSyobocalResult', searchSyobocalResult)

    // ロード中のデータ
    const loadingSlots: Slot[] = []

    // // ニコニコ動画
    // if (searchResult) {
    //   const slots: Slot[] = (
    //     [
    //       ['normal', searchResult.normal],
    //       ['chapter', [searchResult.chapter[0]]],
    //       ['szbh', searchResult.szbh],
    //     ] as const
    //   ).flatMap(([type, result]) => {
    //     return result.map((video) => ({
    //       type,
    //       id: video.contentId,
    //       status: 'loading',
    //       threads: [],
    //       info: {
    //         title: video.title,
    //         duration: video.lengthSeconds,
    //         date: new Date(video.startTime).getTime(),
    //         count: {
    //           view: video.viewCounter,
    //           comment: video.commentCounter,
    //         },
    //         thumbnail: video.thumbnailUrl,
    //       },
    //     }))
    //   })

    //   loadingSlots.push(...slots)
    // }

    // ニコニコ実況 過去ログ
    if (syobocalPrograms) {
      const title = [
        searchSyobocalResult.title.Title,
        `#${searchSyobocalResult.subTitleCount}`,
        searchSyobocalResult.subTitle ?? '',
      ]
        .join(' ')
        .trim()

      const slots: Slot[] = syobocalPrograms.map((program) => {
        const id = `${syobocalToJikkyoChId(program.ChID)}:${program.StTime}-${program.EdTime}`

        const starttime = parseInt(program.StTime) * 1000
        const endtime = parseInt(program.EdTime) * 1000

        return {
          type: 'jikkyo',
          id,
          status: 'loading',
          threads: [],
          info: {
            title,
            duration: (endtime - starttime) / 1000,
            date: [starttime, endtime],
            count: {
              comment: 0,
            },
          },
        }
      })

      loadingSlots.push(...slots)
    }

    this.state.slots.add(...loadingSlots)

    // コメント取得
    this.#trigger('loading')

    const [commentsNormal, commentsChapter, commentsSzbh, commentsJikkyo] =
      await Promise.all([
        // // ニコニコ動画 コメント 取得
        // searchResult
        //   ? this.getNiconicoComments(
        //       searchResult.normal.map(({ contentId }) => ({ contentId }))
        //     )
        //   : null,
        // searchResult
        //   ? this.getNiconicoComments(
        //       searchResult.chapter.map(({ contentId }) => ({ contentId }))
        //     )
        //   : null,
        // searchResult
        //   ? this.getNiconicoComments(
        //       searchResult.szbh.map(({ contentId }) => ({ contentId }))
        //     )
        //   : null,

        // ニコニコが死んでるので
        null,
        null,
        null,

        // ニコニコ実況 過去ログ 取得
        syobocalPrograms
          ? this.getJikkyoKakologs(
              syobocalPrograms.map((val) => ({
                jkChId: syobocalToJikkyoChId(val.ChID)!,
                starttime: parseInt(val.StTime),
                endtime: parseInt(val.EdTime),
              }))
            )
          : null,
      ])

    this.#trigger('loaded')

    // Logger.log('commentsNormal', commentsNormal)
    // Logger.log('commentsChapter', commentsChapter)
    // Logger.log('commentsSzbh', commentsSzbh)
    Logger.log('commentsJikkyo', commentsJikkyo)

    const updateSlots: SlotUpdate[] = []

    // // 通常, コメント専用動画
    // if (commentsNormal || commentsSzbh) {
    //   const slots: SlotUpdate[] = (
    //     [
    //       [searchResult!.normal, commentsNormal],
    //       [searchResult!.szbh, commentsSzbh],
    //     ] as const
    //   ).flatMap(([result, comments]) => {
    //     if (!comments) return []

    //     return comments.flatMap((comment, idx) => {
    //       if (!comment) return []

    //       const { data, threads } = comment

    //       return {
    //         id: result[idx].contentId,
    //         status: 'ready',
    //         threads,
    //         info: {
    //           count: {
    //             view: data.video.count.view,
    //             comment: data.video.count.comment,
    //           },
    //           thumbnail: data.video.thumbnail.url,
    //         },
    //       }
    //     })
    //   })

    //   updateSlots.push(...slots)
    // }

    // // dアニメ・分割
    // if (commentsChapter?.every((_, idx, ary) => ary.at(idx - 1))) {
    //   const data = searchResult!.chapter[0]

    //   const matchSplit = data.title.match(
    //     /^(?<title>.+)Chapter\.(?<chapter>[1-9])$/
    //   )
    //   const chapterTitle = `${matchSplit!.groups!.title.trim()} Chapter.1 〜 ${commentsChapter.length}`

    //   let tmpOffset = 0
    //   let totalDuration = 0
    //   let totalCountView = 0
    //   let totalCountComment = 0
    //   let mergedThreads: V1Thread[] = []

    //   for (const comment of commentsChapter) {
    //     const { data, threads } = comment!

    //     if (tmpOffset) {
    //       for (const thread of threads) {
    //         for (const comment of thread.comments) {
    //           comment.vposMs += tmpOffset
    //         }
    //       }
    //     }

    //     tmpOffset += data.video.duration * 1000
    //     totalDuration += data.video.duration
    //     totalCountView += data.video.count.view
    //     totalCountComment += data.video.count.comment
    //     mergedThreads.push(...threads)
    //   }

    //   updateSlots.push({
    //     id: data.contentId,
    //     status: 'ready',
    //     threads: mergedThreads,
    //     info: {
    //       title: chapterTitle,
    //       duration: totalDuration,
    //       count: {
    //         view: totalCountView,
    //         comment: totalCountComment,
    //       },
    //     },
    //   })
    // }

    // ニコニコ実況
    if (commentsJikkyo) {
      for (const comment of commentsJikkyo) {
        if (!comment) continue

        const { thread, markers } = comment

        updateSlots.push({
          id: thread.id as string,
          status: 'ready',
          threads: [thread],
          markers,
          info: {
            count: {
              comment: thread.commentCount,
            },
          },
        })
      }
    }

    for (const loadingSlot of loadingSlots) {
      const updateSlot = updateSlots.find((v) => v.id === loadingSlot.id)

      if (updateSlot?.info?.count?.comment) {
        this.state.slots.update(updateSlot)
      } else {
        this.state.slots.remove(loadingSlot.id)
      }
    }

    this.#trigger('ready')

    Logger.log('slots', this.state.slots.getAll())
  }

  // /**
  //  * ニコニコ動画のコメント取得
  //  */
  // async getNiconicoComments(
  //   params: {
  //     contentId: string
  //     when?: number
  //   }[]
  // ): Promise<
  //   ({
  //     data: VideoData
  //     threads: V1Thread[]
  //   } | null)[]
  // > {
  //   // 動画情報取得
  //   const videosData = await Promise.all(
  //     params.map(({ contentId }) => {
  //       return ncoApiProxy.niconico.video(contentId)
  //     })
  //   )

  //   // コメント取得
  //   const threadsData = await Promise.all(
  //     videosData.map((video, idx) => {
  //       return video
  //         ? ncoApiProxy.niconico.threads(video.comment.nvComment, {
  //             when: params[idx].when,
  //           })
  //         : null
  //     })
  //   )

  //   return threadsData.map((val, idx) => {
  //     return val
  //       ? {
  //           data: videosData[idx]!,
  //           threads: val.threads,
  //         }
  //       : null
  //   })
  // }

  /**
   * ニコニコ実況 過去ログを取得
   */
  async getJikkyoKakologs(
    params: {
      jkChId: JikkyoChannelId
      starttime: number | Date
      endtime: number | Date
    }[]
  ): Promise<
    ({
      thread: V1Thread
      markers: (number | null)[]
    } | null)[]
  > {
    // 過去ログ取得
    const kakologs = await Promise.all(
      params.map(({ jkChId, starttime, endtime }) => {
        return ncoApiProxy.jikkyo.kakolog(
          jkChId,
          {
            starttime,
            endtime,
            format: 'json',
          },
          {
            compatV1Thread: true,
            userAgent: EXT_USER_AGENT,
          }
        )
      })
    )

    return kakologs.map((thread) => {
      if (thread) {
        const markers = this.findMarkers([thread])

        return { thread, markers }
      } else {
        return null
      }
    })
  }

  /**
   * マーカーの位置を探す
   */
  findMarkers(threads: V1Thread[]) {
    const allComments = threads
      .flatMap((thread) => thread.comments)
      .sort((cmtA, cmtB) => cmtA.vposMs - cmtB.vposMs)

    const segmentedComments: string[][] = [[]]
    const segmentIntervalMs = 5000
    let tmpIdx = 0

    for (const { vposMs, body } of allComments) {
      if (vposMs < segmentIntervalMs * (tmpIdx + 1)) {
        segmentedComments[tmpIdx].push(body)
      } else {
        segmentedComments[++tmpIdx] = [body]
      }
    }

    const markerCounts = MARKERS.map(({ regexp }) => {
      return segmentedComments.map((comments) => {
        return comments.filter((text) => regexp.test(text)).length
      })
    })

    return markerCounts.map((counts) => {
      const max = Math.max(...counts)
      const idx = 3 <= max ? counts.indexOf(max) : -1

      return idx !== -1
        ? Math.trunc(idx * segmentIntervalMs + segmentIntervalMs / 3)
        : null
    })
  }

  #listeners: {
    [type in keyof NCOSearcherEventMap]?: NCOSearcherEventMap[type][]
  } = {}

  #trigger<Type extends keyof NCOSearcherEventMap>(
    type: Type,
    ...args: Parameters<NCOSearcherEventMap[Type]>
  ) {
    if (type in this.#listeners) {
      for (const listener of this.#listeners[type]!) {
        try {
          listener.call(this, ...args)
        } catch (err) {
          Logger.error(type, err)
        }
      }
    }
  }

  addEventListener<Type extends keyof NCOSearcherEventMap>(
    type: Type,
    callback: NCOSearcherEventMap[Type]
  ) {
    this.#listeners[type] ??= []
    this.#listeners[type]!.push(callback)
  }

  removeAllEventListeners() {
    for (const key in this.#listeners) {
      delete this.#listeners[key as keyof NCOSearcherEventMap]
    }
  }
}
