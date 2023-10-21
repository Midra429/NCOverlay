import type { ChromeMessage, ChromeResponse } from '@/types/chrome/message'
import type { SearchData } from '@/types/niconico/search'

export const search = async (
  body: ChromeMessage<'niconico:search'>['body']
): Promise<SearchData[] | null> => {
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
