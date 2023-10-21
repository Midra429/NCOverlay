import type { VideoData } from '@/types/niconico/video'
import type { ThreadsData } from '@/types/niconico/threads'
import { NiconicoApi } from '@/content_script/api/niconico'

export const getThreadsData = async (videoData: {
  normal: VideoData[]
  splited: VideoData[]
}): Promise<ThreadsData[] | null> => {
  const threadsDataNormal: ThreadsData[] = []
  const threadsDataSplited: ThreadsData[] = []

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

    threadsDataNormal.push(...threadsData)
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

    threadsDataSplited.push(...threadsData)
  }

  if (0 < threadsDataNormal.length || 0 < threadsDataSplited.length) {
    return [...threadsDataNormal, ...threadsDataSplited]
  }

  return null
}
