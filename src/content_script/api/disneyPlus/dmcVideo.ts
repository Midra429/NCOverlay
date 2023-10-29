import type { DmcVideo, Video } from '@/types/disneyPlus/dmcVideo'
import { DISNEYPLUS_DMCVIDEO_API } from '@/constants'

export const dmcVideo = async (contentId: string): Promise<Video | null> => {
  try {
    const res = await fetch(`${DISNEYPLUS_DMCVIDEO_API}/${contentId}`)

    if (res.ok) {
      const json: DmcVideo = await res.json()

      if (json.data.DmcVideo.video) {
        return json.data.DmcVideo.video
      }
    }
  } catch (e) {
    console.error('[NCOverlay] Error', e)
  }

  return null
}
