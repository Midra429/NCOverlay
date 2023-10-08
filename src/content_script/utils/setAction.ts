import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'

export const setAction = (body: ChromeMessageBody['chrome:action']) => {
  chrome.runtime.sendMessage<ChromeMessage<'chrome:action'>>({
    type: 'chrome:action',
    body: body,
  })
}
