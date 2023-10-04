import type { ChromeMessage, ChromeResponse } from '@/types/chrome'

export const video = async (id: string, guest?: boolean) => {
  if (id) {
    const res = await chrome.runtime.sendMessage<
      ChromeMessage<'video'>,
      ChromeResponse<'video'>
    >({
      id: Date.now(),
      type: 'video',
      body: {
        videoId: id,
        guest: guest,
      },
    })

    if (res.result) {
      console.log(`[NCOverlay] video${guest ? ' (guest)' : ''}`, res.result)

      return res.result
    }
  }

  return null
}
