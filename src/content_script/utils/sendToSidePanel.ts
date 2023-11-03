import type { WebExtMessageType } from '@/types/webext/message'
import webext from '@/webext'

export const sendToSidePanel = (
  body: WebExtMessageType['webext:sendToSidePanel']['body']
) => {
  webext.runtime.sendMessage({
    type: 'webext:sendToSidePanel',
    body: body,
  })
}
