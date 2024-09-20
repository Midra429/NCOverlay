import type { V1Thread } from '@xpadev-net/niconicomments'
import type { VideoData } from '@midra/nco-api/types/niconico/video'

import { ncoApiProxy } from '@/proxy/nco-api'

import { settings } from '@/utils/settings/extension'
import { filterNvComment } from '@/utils/api/filterNvComment'

/**
 * ニコニコ動画のコメント取得
 */
export const getNiconicoComments = async (
  params: {
    contentId: string
    when?: number
  }[]
): Promise<
  ({
    data: VideoData
    threads: V1Thread[]
  } | null)[]
> => {
  const amount = await settings.get('settings:comment:amount')

  // 動画情報取得
  const videos = await Promise.all(
    params.map(({ contentId }) => {
      return ncoApiProxy.niconico.video(contentId)
    })
  )

  // コメント取得
  const threadsData = await Promise.all(
    videos.map(async (videoData, idx) => {
      if (!videoData) return null

      const nvComment = filterNvComment(videoData.comment)

      if (1 < amount) {
        const baseThreadsData = await ncoApiProxy.niconico.threads(nvComment, {
          when: params[idx].when ?? Math.floor(new Date().getTime() / 1000),
          res_from: -1000,
        })

        const main = baseThreadsData?.threads
          .filter((v) => v.fork === 'main')
          .reduce((prev, current) => {
            return prev.commentCount < current.commentCount ? current : prev
          })

        if (
          !main ||
          !main.commentCount ||
          !main.comments.length ||
          main.comments[0].no < 5
        ) {
          return baseThreadsData
        }

        nvComment.params.targets = nvComment.params.targets.filter((target) => {
          return `${target.fork}:${target.id}` === `${main.fork}:${main.id}`
        })

        let when = Math.floor(
          new Date(main.comments[0].postedAt).getTime() / 1000
        )

        let count = amount - 1

        while (0 < count--) {
          const response = await ncoApiProxy.niconico.threads(nvComment, {
            when,
            res_from: -1000,
          })

          if (!response) break

          const { comments } = response.threads.find((thread) => {
            return `${thread.fork}:${thread.id}` === `${main.fork}:${main.id}`
          })!

          main.comments.push(...comments)

          if (!comments.length || comments[0].no < 5) break

          when = Math.floor(new Date(comments[0].postedAt).getTime() / 1000)
        }

        main.comments = main.comments.sort((a, b) => a.no - b.no)

        return baseThreadsData
      } else {
        return ncoApiProxy.niconico.threads(nvComment, {
          when: params[idx].when,
        })
      }
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
