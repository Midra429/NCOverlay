import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'

export const setActionTitle = (
  body: ChromeMessageBody['chrome:action:title']
) => {
  chrome.runtime.sendMessage<ChromeMessage<'chrome:action:title'>>({
    type: 'chrome:action:title',
    body: body,
  })
}
