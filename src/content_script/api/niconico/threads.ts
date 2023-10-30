import type {
  ChromeMessage,
  ChromeResponse,
  ChromeResponseResult,
} from '@/types/chrome/message'

export const threads = async (
  body: ChromeMessage<'niconico:threads'>['body']
): Promise<ChromeResponseResult['niconico:threads']> => {
  const res = await chrome.runtime.sendMessage<
    ChromeMessage<'niconico:threads'>,
    ChromeResponse<'niconico:threads'>
  >({
    type: 'niconico:threads',
    body: body,
  })

  if (res?.result) {
    return res.result
  }

  return null
}
