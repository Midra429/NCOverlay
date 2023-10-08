import type { V1Thread } from '@xpadev-net/niconicomments'
import type { VideoData } from '@/types/niconico/video'
import type { ThreadsData } from '@/types/niconico/threads'
import { NiconicoApi } from '@/content_script/api/niconico'

export const getThreads = async (
  ...videoData: VideoData[]
): Promise<V1Thread[] | null> => {
  if (0 < videoData.length) {
    const threadsData: ThreadsData[] = []

    for (const data of videoData) {
      const res = await NiconicoApi.threads({
        additionals: {},
        params: data.comment.nvComment.params,
        threadKey: data.comment.nvComment.threadKey,
      })

      if (res) {
        threadsData.push(res)
      }
    }

    console.log('[NCOverlay] threadsData', threadsData)

    let threads = threadsData.map((v) => v.threads).flat()

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
