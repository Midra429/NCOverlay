import type { ChromeMessage, ChromeResponse } from '@/types/chrome'
import type { NvCommentBody } from '@/api/niconico/threads'

export const threads = async (nvComment: NvCommentBody) => {
  const res = await chrome.runtime.sendMessage<
    ChromeMessage<'threads'>,
    ChromeResponse<'threads'>
  >({
    id: Date.now(),
    type: 'threads',
    body: {
      nvComment: nvComment,
    },
  })

  if (res.result) {
    console.log('[NCOverlay] threads', res.result)

    return res.result
  }

  return null
}
