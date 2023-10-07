import type { VideoData } from '@/types/niconico/video'
import { NiconicoApi } from '@/content_script/api/niconico'

export const getVideoData = async (
  ...contentIds: string[]
): Promise<VideoData[] | null> => {
  contentIds = contentIds.filter(Boolean)

  if (0 < contentIds.length) {
    const videoData: VideoData[] = []

    for (const id of contentIds) {
      const result = await NiconicoApi.video(id)

      if (result) {
        videoData.push(result)
      }
    }

    console.log('[NCOverlay] videoData', videoData)

    if (videoData.length === 0) {
      for (const id of contentIds) {
        const result = await NiconicoApi.video(id, true)

        if (result) {
          videoData.push(result)
        }
      }

      console.log('[NCOverlay] videoData (guest)', videoData)
    }

    if (0 < videoData.length) {
      return videoData
    }
  }

  return null
}
