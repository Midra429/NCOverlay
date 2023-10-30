import type {
  ChromeMessage,
  ChromeResponse,
  ChromeResponseResult,
} from '@/types/chrome/message'

export const video = async (
  body: ChromeMessage<'niconico:video'>['body']
): Promise<ChromeResponseResult['niconico:video']> => {
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
