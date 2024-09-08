import type { V1Thread } from '@xpadev-net/niconicomments'
import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { VideoData } from '@midra/nco-api/types/niconico/video'
import type { BuildSearchQueryInput } from '@midra/nco-api/search/lib/buildSearchQuery'
import type {
  NCOState,
  StateSlot,
  StateSlotDetail,
  StateSlotDetailUpdate,
} from './state'

import { syobocalToJikkyoChId } from '@midra/nco-api/utils/syobocalToJikkyoChId'

import { MARKERS } from '@/constants/markers'

import { Logger } from '@/utils/logger'
import { filterNvComment } from '@/utils/extension/filterNvComment'
import {
  convertNgSettings,
  applyNgSettings,
} from '@/utils/extension/applyNgSetting'
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

export type NCOSearcherEventMap = {
  searching: (this: NCOSearcher) => void
  searched: (this: NCOSearcher) => void
  loading: (this: NCOSearcher) => void
  loaded: (this: NCOSearcher) => void
  ready: (this: NCOSearcher) => void
  error: (this: NCOSearcher) => void
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
    // 検索
    this.#trigger('searching')

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

    this.#trigger('searched')

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
    this.#trigger('loading')
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
      this.getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'normal')
          .map((v) => ({ contentId: v.id }))
      ),
      this.getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'danime')
          .map((v) => ({ contentId: v.id }))
      ),
      this.getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'szbh')
          .map((v) => ({ contentId: v.id }))
      ),
      this.getNiconicoComments(
        loadingSlotDetails
          .filter((v) => v.type === 'chapter')
          .map((v) => ({ contentId: v.id }))
      ),

      // ニコニコ実況 過去ログ 取得
      scPrograms
        ? this.getJikkyoKakologs(
            scPrograms.map((val) => ({
              jkChId: syobocalToJikkyoChId(val.ChID)!,
              starttime: parseInt(val.StTime),
              endtime: parseInt(val.EdTime),
            }))
          )
        : null,
    ])

    this.#trigger('loaded')

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

          loadedSlots.push({
            id,
            threads: applyNgSettings(
              threads,
              convertNgSettings(cmt.data.comment.ng)
            ),
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
        if (!video) return null

        const nvComment = filterNvComment(video.comment)

        return ncoApiProxy.niconico.threads(nvComment, {
          when: params[idx].when,
        })
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
