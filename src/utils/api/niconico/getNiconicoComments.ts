import type { V1Thread } from '@midra/nco-utils/types/api/niconico/v1/threads'
import type { VideoData } from '@midra/nco-utils/types/api/niconico/video'

import { KAWAII_REGEXP } from '@/constants'

import { settings } from '@/utils/settings/extension'
import { extractNgSettings } from '@/utils/api/niconico/extractNgSettings'
import { applyNgSettings } from '@/utils/api/niconico/applyNgSetting'
import { filterNvComment } from '@/utils/api/niconico/filterNvComment'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

/**
 * ニコニコ動画のコメント取得
 */
export async function getNiconicoComments(
  params: ((
    | VideoData
    | {
        contentId: string
      }
  ) & {
    when?: number
  })[]
): Promise<
  ({
    data: VideoData
    threads: V1Thread[]
    kawaiiCount: number
  } | null)[]
> {
  const useNiconicoCredentials = await settings.get(
    'settings:comment:useNiconicoCredentials'
  )
  const amount = useNiconicoCredentials
    ? await settings.get('settings:comment:amount')
    : 1

  const credentials: RequestInit['credentials'] = useNiconicoCredentials
    ? 'include'
    : 'omit'

  // 動画情報取得
  const videos = await Promise.all(
    params.map((val) => {
      return 'contentId' in val
        ? ncoApiProxy.niconico.video(val.contentId, credentials)
        : val
    })
  )

  // コメント取得
  const threadsData = await Promise.all(
    videos.map(async (videoData, idx) => {
      if (!videoData) return null

      filterNvComment(videoData.comment)

      if (1 < amount) {
        const additionals = {
          when: params[idx].when ?? Math.floor(Date.now() / 1000),
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

        if (
          !baseMainThread?.comments.length ||
          baseMainThread.comments[0].no < 5
        ) {
          return baseThreadsData
        }

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

        return baseThreadsData
      } else {
        return ncoApiProxy.niconico.v1.threads(videoData.comment, {
          when: params[idx].when,
        })
      }
    })
  )

  return threadsData.map((val, idx) => {
    if (val) {
      const data = videos[idx]!

      // コメントのNG設定を適用
      const threads = applyNgSettings(
        val.threads,
        extractNgSettings(data.comment.ng)
      )

      const kawaiiCount = threads
        .map((thread) => {
          return thread.comments.filter((cmt) => {
            return KAWAII_REGEXP.test(cmt.body)
          }).length
        })
        .reduce((prev, current) => prev + current, 0)

      return { data, threads, kawaiiCount }
    } else {
      return null
    }
  })
}
