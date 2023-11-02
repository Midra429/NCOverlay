import type { WebExtMessageBody } from '@/types/webext/message'
import webext from '@/webext'

export const sendToPopup = (body: WebExtMessageBody['webext:sendToPopup']) => {
  webext.runtime.sendMessage<'webext:sendToPopup'>({
    type: 'webext:sendToPopup',
    body: body,
  })
}
