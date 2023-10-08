import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'

export const setActionBadge = (
  body: ChromeMessageBody['chrome:action:badge']
) => {
  chrome.runtime.sendMessage<ChromeMessage<'chrome:action:badge'>>({
    type: 'chrome:action:badge',
    body: body,
  })
}
