import type { VideoData } from '@/types/niconico/video'
import { NiconicoApi } from '@/content_script/api/niconico'

export const getVideoData = async (ids: {
  normal: string[]
  splited: string[]
}): Promise<{
  normal: VideoData[]
  splited: VideoData[]
} | null> => {
  ids.normal = ids.normal?.filter(Boolean)
  ids.splited = ids.splited?.filter(Boolean)

  const videoDataNormal: VideoData[] = []
  const videoDataSplited: VideoData[] = []

  // 通常の動画
  if (0 < ids.normal.length) {
    const videoData: VideoData[] = []

    for (const id of ids.normal) {
      const res = await NiconicoApi.video({ videoId: id })

      if (res) {
        videoData.push(res)
      }
    }

    console.log('[NCOverlay] videoData', videoData)

    if (videoData.length === 0) {
      for (const id of ids.normal) {
        const res = await NiconicoApi.video({ videoId: id, guest: true })

        if (res) {
          videoData.push(res)
        }
      }

      console.log('[NCOverlay] videoData (guest)', videoData)
    }

    videoDataNormal.push(...videoData)
  }

  // 分割されている動画
  if (0 < ids.splited.length) {
    const videoData: VideoData[] = []

    for (const id of ids.splited) {
      const res = await NiconicoApi.video({ videoId: id })

      if (res) {
        videoData.push(res)
      }
    }

    console.log('[NCOverlay] videoData (splited)', videoData)

    videoDataSplited.push(...videoData)
  }

  if (0 < videoDataNormal.length || 0 < videoDataSplited.length) {
    return {
      normal: videoDataNormal,
      splited: videoDataSplited,
    }
  }

  return null
}
