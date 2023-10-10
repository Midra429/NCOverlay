import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'

export const setSidePanel = (body: ChromeMessageBody['chrome:side_panel']) => {
  chrome.runtime.sendMessage<ChromeMessage<'chrome:side_panel'>>({
    type: 'chrome:side_panel',
    body: body,
  })
}
