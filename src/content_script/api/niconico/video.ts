import type { ChromeMessage, ChromeResponse } from '@/types/chrome/message'
import type { VideoData } from '@/types/niconico/video'

export const video = async (
  body: ChromeMessage<'niconico:video'>['body']
): Promise<VideoData | null> => {
  if (body.videoId) {
    const res = await chrome.runtime.sendMessage<
      ChromeMessage<'niconico:video'>,
      ChromeResponse<'niconico:video'>
    >({
      type: 'niconico:video',
      body: body,
    })

    if (res?.result) {
      return res.result
    }
  }

  return null
}
