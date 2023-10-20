import type { ChromeMessage, ChromeResponse } from '@/types/chrome/message'
import type { ThreadsData } from '@/types/niconico/threads'

export const threads = async (
  body: ChromeMessage<'niconico:threads'>['body']
): Promise<ThreadsData | null> => {
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
