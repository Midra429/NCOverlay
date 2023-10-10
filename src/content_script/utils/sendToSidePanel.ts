import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'

export const sendToSidePanel = (
  body: ChromeMessageBody['chrome:sendToSidePanel']
) => {
  chrome.runtime.sendMessage<ChromeMessage<'chrome:sendToSidePanel'>>({
    type: 'chrome:sendToSidePanel',
    body: body,
  })
}
