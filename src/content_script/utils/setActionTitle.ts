import type { WebExtMessageType } from '@/types/webext/message'
import webext from '@/webext'

export const setActionTitle = (
  body: WebExtMessageType['webext:action:title']['body']
) => {
  webext.runtime.sendMessage({
    type: 'webext:action:title',
    body: body,
  })
}
