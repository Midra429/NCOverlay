import type {
  ChromeMessage,
  ChromeResponse,
  ChromeResponseResult,
} from '@/types/chrome/message'

export const search = async (
  body: ChromeMessage<'niconico:search'>['body']
): Promise<ChromeResponseResult['niconico:search']> => {
  const res = await chrome.runtime.sendMessage<
    ChromeMessage<'niconico:search'>,
    ChromeResponse<'niconico:search'>
  >({
    type: 'niconico:search',
    body: body,
  })

  if (res?.result) {
    return res.result
  }

  return null
}
