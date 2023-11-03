import type { WebExtMessageType } from '@/types/webext/message'
import webext from '@/webext'

export const sendToPopup = (
  body: WebExtMessageType['webext:sendToPopup']['body']
) => {
  webext.runtime.sendMessage({
    type: 'webext:sendToPopup',
    body: body,
  })
}
