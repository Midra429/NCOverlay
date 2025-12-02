import type {
  V1Thread,
  V1ThreadsData,
} from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { VideoData } from '@midra/nco-utils/types/api/niconico/video'

import { KAWAII_REGEXP } from '@/constants'

import { settings } from '@/utils/settings/extension'
import { extractNgSettings } from '@/utils/api/niconico/extractNgSettings'
import { applyNgSettings } from '@/utils/api/niconico/applyNgSetting'
import { filterNvComment } from '@/utils/api/niconico/filterNvComment'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export interface GetNiconicoCommentResult {
  videoData: VideoData
  threads: V1Thread[]
  kawaiiCount: number
}

/**
 * ニコニコ動画のコメント取得
 */
export async function getNiconicoComment(
  query: string | VideoData,
  when?: number
): Promise<GetNiconicoCommentResult | null> {
  const [useNiconicoCredentials, amount] = await settings.get(
    'settings:comment:useNiconicoCredentials',
    'settings:comment:amount'
  )

  // 動画情報取得
  const videoData =
    typeof query === 'string'
      ? await ncoApiProxy.niconico.video(
          query,
          useNiconicoCredentials ? 'include' : 'omit'
        )
      : query

  if (!videoData) {
    return null
  }

  // コメント取得
  filterNvComment(videoData.comment)

  let threadsData: V1ThreadsData | null

  if (useNiconicoCredentials && 1 < amount) {
    const additionals = {
      when: when || Math.floor(Date.now() / 1000),
      res_from: -1000,
    }

    const baseThreadsData = await ncoApiProxy.niconico.v1.threads(
      videoData.comment,
      additionals
    )
    const baseMainThread = baseThreadsData?.threads
      .filter((v) => v.fork === 'main')
      .reduce((prev, current) => {
        return prev.commentCount < current.commentCount ? current : prev
      })

    if (!baseMainThread?.comments.length || baseMainThread.comments[0].no < 5) {
      threadsData = baseThreadsData
    } else {
      videoData.comment.nvComment.params.targets =
        videoData.comment.nvComment.params.targets.filter((val) => {
          return (
            val.fork === baseMainThread.fork && val.id === baseMainThread.id
          )
        })

      additionals.when = Math.floor(
        new Date(baseMainThread.comments[0].postedAt).getTime() / 1000
      )

      let count = amount - 1

      while (0 < count--) {
        const threadsData = await ncoApiProxy.niconico.v1.threads(
          videoData.comment,
          additionals
        )
        const mainThread = threadsData?.threads.find((val) => {
          return (
            val.fork === baseMainThread.fork && val.id === baseMainThread.id
          )
        })

        if (!mainThread?.comments.length) break

        baseMainThread.comments.push(...mainThread.comments)

        if (mainThread.comments[0].no < 5) break

        additionals.when = Math.floor(
          new Date(mainThread.comments[0].postedAt).getTime() / 1000
        )
      }

      baseMainThread.comments.sort((a, b) => a.no - b.no)

      threadsData = baseThreadsData
    }
  } else {
    threadsData = await ncoApiProxy.niconico.v1.threads(videoData.comment, {
      when,
    })
  }

  if (!threadsData) {
    return null
  }

  // コメントのNG設定を適用
  const threads = applyNgSettings(
    threadsData.threads,
    extractNgSettings(videoData.comment.ng)
  )

  const kawaiiCount = threads
    .map((thread) => {
      return thread.comments.filter((cmt) => {
        return KAWAII_REGEXP.test(cmt.body)
      }).length
    })
    .reduce((prev, current) => prev + current, 0)

  return { videoData, threads, kawaiiCount }
}
