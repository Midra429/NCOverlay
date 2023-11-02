import type { WebExtMessageBody } from '@/types/webext/message'
import webext from '@/webext'

export const sendToSidePanel = (
  body: WebExtMessageBody['webext:sendToSidePanel']
) => {
  webext.runtime.sendMessage<'webext:sendToSidePanel'>({
    type: 'webext:sendToSidePanel',
    body: body,
  })
}
