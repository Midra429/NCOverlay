import type { ChromeMessage, ChromeResponse } from '@/types/chrome/message'
import type { ThreadsData } from '@/types/niconico/threads'
import type { NvCommentBody } from '@/background/api/niconico/threads'

export const threads = async (
  nvComment: NvCommentBody
): Promise<ThreadsData | null> => {
  const res = await chrome.runtime.sendMessage<
    ChromeMessage<'niconico:threads'>,
    ChromeResponse<'niconico:threads'>
  >({
    type: 'niconico:threads',
    body: {
      nvComment: nvComment,
    },
  })

  if (res?.result) {
    return res.result
  }

  return null
}
