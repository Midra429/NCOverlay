import type { ChromeMessage, ChromeResponse } from '@/types/chrome'
import type { VideoData } from '@/types/niconico/video'

export const video = async (
  id: string,
  guest?: boolean
): Promise<VideoData | null> => {
  if (id) {
    const res = await chrome.runtime.sendMessage<
      ChromeMessage<'niconico:video'>,
      ChromeResponse<'niconico:video'>
    >({
      id: Date.now(),
      type: 'niconico:video',
      body: {
        videoId: id,
        guest: guest,
      },
    })

    if (res.result) {
      return res.result
    }
  }

  return null
}
