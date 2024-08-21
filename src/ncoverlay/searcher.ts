import type { V1Thread } from '@xpadev-net/niconicomments'
import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { VideoData } from '@midra/nco-api/types/niconico/video'
import type {
  NCOState,
  StateSlot,
  StateSlotDetail,
  StateSlotDetailUpdate,
} from './state'

import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

import { MARKERS } from '@/constants/markers'

import { Logger } from '@/utils/logger'
import { ncoApiProxy } from '@/proxy/nco-api'

export type AutoLoadInput = {
  title?: string | null
  seasonText?: string | null
  seasonNumber?: number | null
  episodeText?: string | null
  episodeNumber?: number | null
  subtitle?: string | null
  duration: number
}

const userAgent = EXT_USER_AGENT

export type NCOSearcherEventMap = {
  searching: (this: NCOSearcher) => void
  searched: (this: NCOSearcher) => void
  loading: (this: NCOSearcher) => void
  loaded: (this: NCOSearcher) => void
  ready: (this: NCOSearcher) => void
  error: (this: NCOSearcher) => void
}

/**
 * NCOverlayの検索担当
 */
export class NCOSearcher {
  readonly #state: NCOState

  constructor(state: NCOState) {
    this.#state = state
  }

  async autoLoad(
    input: AutoLoadInput,
    options: {
      normal?: boolean
      szbh?: boolean
      chapter?: boolean
      jikkyo?: boolean
    } = {}
  ) {
    // 検索
    this.#trigger('searching')

    const rawText = [
      input.title,
      input.seasonText,
      input.episodeText,
      input.subtitle,
    ]
      .filter(Boolean)
      .join(' ')

    const [searchResult, searchSyobocalResult] = await Promise.all([
      // ニコニコ動画 検索
      rawText
        ? ncoApiProxy.search({
            rawText,
            duration: input.duration,
            normal: options.normal,
            szbh: options.szbh,
            chapter: options.chapter,
            userAgent,
          })
        : null,

      // ニコニコ実況 過去ログ 検索
      options.jikkyo ? ncoApiProxy.searchSyobocal(input, { userAgent }) : null,
    ])

    const currentTime = Date.now() / 1000

    const syobocalPrograms =
      searchSyobocalResult &&
      searchSyobocalResult.programs.filter(
        (val) => parseInt(val.EdTime) < currentTime
      )

    this.#trigger('searched')

    Logger.log('searchResult:', searchResult)
    Logger.log('searchSyobocalResult:', searchSyobocalResult)

    // ロード中のデータ
    const loadingSlotDetails: StateSlotDetail[] = []

    // ニコニコ動画
    if (searchResult) {
      ;(
        [
          ['normal', searchResult.normal],
          ['szbh', searchResult.szbh],
          ['chapter', [searchResult.chapter[0]]],
        ] as const
      ).forEach(([type, result]) => {
        result.forEach((video) => {
          if (!video) return

          loadingSlotDetails.push({
            type,
            id: video.contentId,
            status: 'loading',
            info: {
              id: video.contentId,
              title: video.title,
              duration: video.lengthSeconds,
              date: new Date(video.startTime).getTime(),
              count: {
                view: video.viewCounter,
                comment: video.commentCounter,
              },
              thumbnail: video.thumbnailUrl,
            },
          })
        })
      })
    }

    // ニコニコ実況 過去ログ
    if (syobocalPrograms) {
      const title = [
        searchSyobocalResult.title.Title,
        `#${input.episodeNumber}`,
        searchSyobocalResult.subtitle ?? '',
      ]
        .join(' ')
        .trim()

      syobocalPrograms.forEach((program) => {
        const id = `${syobocalToJikkyoChId(program.ChID)}:${program.StTime}-${program.EdTime}`

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

    await this.#state.set('slotDetails', loadingSlotDetails)

    // コメント取得
    this.#trigger('loading')
    await this.#state.set('status', 'loading')

    const [commentsNormal, commentsSzbh, commentsChapter, commentsJikkyo] =
      await Promise.all([
        // ニコニコ動画 コメント 取得
        searchResult
          ? this.getNiconicoComments(
              searchResult.normal.map(({ contentId }) => ({ contentId }))
            )
          : null,
        searchResult
          ? this.getNiconicoComments(
              searchResult.szbh.map(({ contentId }) => ({ contentId }))
            )
          : null,
        searchResult
          ? this.getNiconicoComments(
              searchResult.chapter.map(({ contentId }) => ({ contentId }))
            )
          : null,

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

    Logger.log('commentsNormal:', commentsNormal)
    Logger.log('commentsSzbh:', commentsSzbh)
    Logger.log('commentsChapter:', commentsChapter)
    Logger.log('commentsJikkyo:', commentsJikkyo)

    const loadedSlots: StateSlot[] = []
    const updateSlotDetails: StateSlotDetailUpdate[] = []

    // 通常, コメント専用動画
    if (commentsNormal || commentsSzbh) {
      ;(
        [
          [searchResult!.normal, commentsNormal],
          [searchResult!.szbh, commentsSzbh],
        ] as const
      ).forEach(([result, comments]) => {
        comments?.forEach((comment, idx) => {
          if (!comment) return

          const id = result[idx].contentId
          const { data, threads } = comment

          loadedSlots.push({ id, threads })

          updateSlotDetails.push({
            id,
            status: 'ready',
            info: {
              count: {
                view: data.video.count.view,
                comment: data.video.count.comment,
              },
              thumbnail: data.video.thumbnail.url,
            },
          })
        })
      })
    }

    // dアニメ・分割
    if (
      commentsChapter?.length &&
      commentsChapter.every((_, idx, ary) => ary.at(idx - 1))
    ) {
      const data = searchResult!.chapter[0]
      const id = data.contentId

      const matchSplit = data.title.match(
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

    for (const { id } of loadingSlotDetails) {
      const loadedSlotIdx = loadedSlots.findIndex((v) => v.id === id)
      const updateDetail = updateSlotDetails.find((v) => v.id === id)

      if (loadedSlotIdx !== -1 && updateDetail?.info?.count?.comment) {
        await this.#state.update('slotDetails', ['id'], updateDetail)
      } else {
        loadedSlots.splice(loadedSlotIdx, 1)
        await this.#state.remove('slotDetails', { id })
      }
    }

    await this.#state.set('slots', loadedSlots)

    this.#trigger('ready')

    Promise.all([
      this.#state.get('slots'),
      this.#state.get('slotDetails'),
    ]).then(([slots, slotDetails]) => {
      Logger.log('slots:', slots)
      Logger.log('slotDetails:', slotDetails)
    })
  }

  /**
   * ニコニコ動画のコメント取得
   */
  async getNiconicoComments(
    params: {
      contentId: string
      when?: number
    }[]
  ): Promise<
    ({
      data: VideoData
      threads: V1Thread[]
    } | null)[]
  > {
    // 動画情報取得
    const videos = await Promise.all(
      params.map(({ contentId }) => {
        return ncoApiProxy.niconico.video(contentId)
      })
    )

    // コメント取得
    const threadsData = await Promise.all(
      videos.map((video, idx) => {
        return video
          ? ncoApiProxy.niconico.threads(video.comment.nvComment, {
              when: params[idx].when,
            })
          : null
      })
    )

    return threadsData.map((val, idx) => {
      return val
        ? {
            data: videos[idx]!,
            threads: val.threads,
          }
        : null
    })
  }

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
            userAgent,
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
    const comments = threads
      .flatMap((thread) => thread.comments)
      .sort((cmtA, cmtB) => cmtA.vposMs - cmtB.vposMs)

    return MARKERS.map(({ regexp }) => {
      let tmpCount = 0
      let tmpVposMs = 0

      comments
        .filter((cmt) => regexp.test(cmt.body))
        .forEach((cmt, idx, ary) => {
          const commentsInRange = ary.slice(idx).filter((val) => {
            return val.vposMs - cmt.vposMs <= 5000
          })
          const count = commentsInRange.length

          if (tmpCount < count) {
            const first = commentsInRange.at(0)!
            const last = commentsInRange.at(-1)!

            tmpCount = count
            tmpVposMs = Math.trunc(
              first.vposMs + (last.vposMs - first.vposMs) / 4
            )
          }
        })

      if (2 <= tmpCount && tmpVposMs) {
        return tmpVposMs
      }

      return null
    })
  }

  #listeners: {
    [type in keyof NCOSearcherEventMap]?: NCOSearcherEventMap[type][]
  } = {}

  #trigger<Type extends keyof NCOSearcherEventMap>(
    type: Type,
    ...args: Parameters<NCOSearcherEventMap[Type]>
  ) {
    this.#listeners[type]?.forEach((listener) => {
      try {
        listener.call(this, ...args)
      } catch (err) {
        Logger.error(type, err)
      }
    })
  }

  addEventListener<Type extends keyof NCOSearcherEventMap>(
    type: Type,
    callback: NCOSearcherEventMap[Type]
  ) {
    this.#listeners[type] ??= []
    this.#listeners[type]!.push(callback)
  }

  removeEventListener<Type extends keyof NCOSearcherEventMap>(
    type: Type,
    callback: NCOSearcherEventMap[Type]
  ) {
    this.#listeners[type] = this.#listeners[type]?.filter(
      (cb) => cb !== callback
    )
  }

  removeAllEventListeners() {
    for (const key in this.#listeners) {
      delete this.#listeners[key as keyof NCOSearcherEventMap]
    }
  }
}
