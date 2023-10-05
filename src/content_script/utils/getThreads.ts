import type { V1Thread } from '@xpadev-net/niconicomments'
import type { ThreadsData } from '@/types/niconico/threads'
import { NiconicoApi } from '@/content_script/api/niconico'
import { getVideoData } from './getVideoData'

export const getThreads = async (
  ...contentIds: string[]
): Promise<V1Thread[] | null> => {
  contentIds = contentIds.filter(Boolean)

  if (0 < contentIds.length) {
    const videoData = (await getVideoData(...contentIds)) ?? []

    const threadsData = (
      await Promise.all(
        videoData.map((val) =>
          NiconicoApi.threads({
            additionals: {},
            params: val!.comment.nvComment.params,
            threadKey: val!.comment.nvComment.threadKey,
          })
        )
      )
    ).filter(Boolean) as ThreadsData[]

    console.log('[NCOverlay] threadsData', threadsData)

    let threads = threadsData.map((v) => v!.threads).flat()

    threads = threads
      .filter((v) => 0 < v.commentCount)
      .filter((v) => v.fork !== 'easy')
      .filter((val, idx, ary) => {
        return (
          idx === ary.findIndex((v) => v.id === val.id && v.fork === val.fork)
        )
      })

    if (0 < threads.length) {
      return threads
    }
  }

  return null
}
