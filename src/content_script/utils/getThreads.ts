import type { V1Thread } from '@xpadev-net/niconicomments'
import type { VideoData } from '@/types/niconico/video'
import type { ThreadsData } from '@/types/niconico/threads'
import { NiconicoApi } from '@/content_script/api/niconico'

export const getThreads = async (videoData: {
  normal: VideoData[]
  splited: VideoData[]
}): Promise<V1Thread[] | null> => {
  let threads: V1Thread[] = []

  // 通常の動画
  if (0 < videoData.normal.length) {
    const threadsData: ThreadsData[] = []

    for (const data of videoData.normal) {
      const res = await NiconicoApi.threads({
        nvComment: {
          additionals: {},
          params: data.comment.nvComment.params,
          threadKey: data.comment.nvComment.threadKey,
        },
      })

      if (res) {
        threadsData.push(res)
      }
    }

    console.log('[NCOverlay] threadsData', threadsData)

    threads.push(...threadsData.map((v) => v.threads).flat())
  }

  // 分割されている動画
  if (0 < videoData.splited.length) {
    const threadsData: ThreadsData[] = []

    let totalDurationMs = 0
    for (let i = 0; i < videoData.splited.length; i++) {
      const res = await NiconicoApi.threads({
        nvComment: {
          additionals: {},
          params: videoData.splited[i].comment.nvComment.params,
          threadKey: videoData.splited[i].comment.nvComment.threadKey,
        },
      })

      if (res) {
        if (0 < i) {
          totalDurationMs += videoData.splited[i - 1].video.duration * 1000

          for (const thread of res.threads) {
            for (const comment of thread.comments) {
              comment.vposMs += totalDurationMs
            }
          }
        }

        threadsData.push(res)
      } else {
        threadsData.splice(0)
        break
      }
    }

    console.log('[NCOverlay] threadsData (splited)', threadsData)

    threads.push(...threadsData.map((v) => v.threads).flat())
  }

  threads = threads
    .filter((v) => 0 < v.commentCount)
    .filter((v) => v.fork !== 'easy')
    .filter((val, idx, ary) => {
      return (
        idx === ary.findIndex((v) => v.id === val.id && v.fork === val.fork)
      )
    })

  console.log('[NCOverlay] threads', threads)

  if (0 < threads.length) {
    return threads
  }

  return null
}
