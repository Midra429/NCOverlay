import type { ChromeMessage, ChromeResponse } from '@/types/chrome'
import type { ThreadsData } from '@/types/niconico/threads'
import type { NvCommentBody } from '@/background/api/niconico/threads'

export const threads = async (
  nvComment: NvCommentBody
): Promise<ThreadsData | null> => {
  const res = await chrome.runtime.sendMessage<
    ChromeMessage<'niconico:threads'>,
    ChromeResponse<'niconico:threads'>
  >({
    id: Date.now(),
    type: 'niconico:threads',
    body: {
      nvComment: nvComment,
    },
  })

  if (res.result) {
    return res.result
  }

  return null
}
