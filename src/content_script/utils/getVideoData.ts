import type { VideoData } from '@/types/niconico/video'
import { NiconicoApi } from '@/content_script/api/niconico'

const filterVideoData = (videoData: VideoData[]) => {
  return videoData.filter((val, idx, ary) => {
    return (
      // コメントあり
      0 < val.video.count.comment
    )
  })
}

export const getVideoData = async (ids: {
  normal?: string[]
  splited?: string[]
}): Promise<{
  normal: VideoData[]
  splited: VideoData[]
} | null> => {
  ids.normal = ids.normal?.flatMap((v) => v || []) ?? []
  ids.splited = ids.splited?.flatMap((v) => v || []) ?? []

  let videoDataNormal: VideoData[] = []
  let videoDataSplited: VideoData[] = []

  // 通常の動画
  if (0 < ids.normal.length) {
    const videoData: VideoData[] = []

    for (const id of ids.normal) {
      const res = await NiconicoApi.video([id])

      if (res) {
        videoData.push(res)
      }
    }

    console.log('[NCOverlay] videoData', videoData)

    if (videoData.length === 0) {
      for (const id of ids.normal) {
        const res = await NiconicoApi.video([id, true])

        if (res) {
          videoData.push(res)
        }
      }

      console.log('[NCOverlay] videoData (guest)', videoData)
    }

    for (const data of videoData) {
      data._nco_extra_info = { type: 'normal' }
    }

    videoDataNormal.push(...videoData)
  }

  // 分割されている動画
  if (0 < ids.splited.length) {
    const videoData: VideoData[] = []

    for (const id of ids.splited) {
      const res = await NiconicoApi.video([id])

      if (res) {
        videoData.push(res)
      }
    }

    console.log('[NCOverlay] videoData (splited)', videoData)

    for (const data of videoData) {
      data._nco_extra_info = { type: 'splited' }
    }

    videoDataSplited.push(...videoData)
  }

  videoDataNormal = filterVideoData(videoDataNormal)
  videoDataSplited = filterVideoData(videoDataSplited)

  if (0 < videoDataNormal.length || 0 < videoDataSplited.length) {
    return {
      normal: videoDataNormal,
      splited: videoDataSplited,
    }
  }

  return null
}
