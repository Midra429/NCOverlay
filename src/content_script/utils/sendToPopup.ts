import type { ChromeMessage, ChromeMessageBody } from '@/types/chrome/message'

export const sendToPopup = (body: ChromeMessageBody['chrome:sendToPopup']) => {
  chrome.runtime.sendMessage<ChromeMessage<'chrome:sendToPopup'>>({
    type: 'chrome:sendToPopup',
    body: body,
  })
}
