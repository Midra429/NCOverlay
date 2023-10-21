import type { VideoData } from '@/types/niconico/video'
import type { ThreadsData } from '@/types/niconico/threads'
import { NiconicoApi } from '@/content_script/api/niconico'

export const getThreadsData = async (videoData: {
  normal?: VideoData[]
  splited?: VideoData[]
}): Promise<{
  [id: string]: ThreadsData
} | null> => {
  videoData.normal ??= []
  videoData.splited ??= []

  let threadsDataNormal: { [id: string]: ThreadsData } = {}
  let threadsDataSplited: { [id: string]: ThreadsData } = {}

  // 通常の動画
  if (0 < videoData.normal.length) {
    for (const data of videoData.normal) {
      const res = await NiconicoApi.threads({
        nvComment: {
          additionals: {},
          params: data.comment.nvComment.params,
          threadKey: data.comment.nvComment.threadKey,
        },
      })

      if (res) {
        threadsDataNormal[data.video.id] = res
      }
    }

    console.log('[NCOverlay] threadsData', threadsDataNormal)
  }

  // 分割されている動画
  if (0 < videoData.splited.length) {
    let tmpOffset = 0
    for (let i = 0; i < videoData.splited.length; i++) {
      const data = videoData.splited[i]
      const res = await NiconicoApi.threads({
        nvComment: {
          additionals: {},
          params: data.comment.nvComment.params,
          threadKey: data.comment.nvComment.threadKey,
        },
      })

      if (res) {
        if (0 < tmpOffset) {
          for (const thread of res.threads) {
            for (const comment of thread.comments) {
              comment.vposMs += tmpOffset
            }
          }
        }

        tmpOffset += data.video.duration * 1000

        threadsDataSplited[data.video.id] = res
      } else {
        threadsDataSplited = {}
        break
      }
    }

    console.log('[NCOverlay] threadsData (splited)', threadsDataSplited)
  }

  if (
    0 < Object.keys(threadsDataNormal).length ||
    0 < Object.keys(threadsDataSplited).length
  ) {
    return {
      ...threadsDataNormal,
      ...threadsDataSplited,
    }
  }

  return null
}
