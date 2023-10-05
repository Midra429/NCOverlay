import type { ChromeMessage, ChromeResponse } from '@/types/chrome'

export const setBadgeText = async (text?: string | number | null) => {
  return chrome.runtime.sendMessage<
    ChromeMessage<'chrome:badge'>,
    ChromeResponse<'chrome:badge'>
  >({
    id: Date.now(),
    type: 'chrome:badge',
    body: text?.toString() ?? '',
  })
}
