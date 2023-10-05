import type { VideoData } from '@/types/niconico/video'
import { NiconicoApi } from '@/content_script/api/niconico'

export const getVideoData = async (
  ...contentIds: string[]
): Promise<VideoData[] | null> => {
  contentIds = contentIds.filter(Boolean)

  if (0 < contentIds.length) {
    let videoData = (
      await Promise.all(contentIds.map((v) => NiconicoApi.video(v)))
    ).filter(Boolean) as VideoData[]

    console.log('[NCOverlay] videoData', videoData)

    if (videoData.length === 0) {
      videoData = (
        await Promise.all(contentIds.map((v) => NiconicoApi.video(v, true)))
      ).filter(Boolean) as VideoData[]

      console.log('[NCOverlay] videoData (guest)', videoData)
    }

    if (0 < videoData.length) {
      return videoData
    }
  }

  return null
}
