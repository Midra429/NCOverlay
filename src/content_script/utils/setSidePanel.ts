import type { WebExtMessageType } from '@/types/webext/message'
import webext from '@/webext'

export const setSidePanel = (
  body: WebExtMessageType['webext:side_panel']['body']
) => {
  webext.runtime.sendMessage({
    type: 'webext:side_panel',
    body: body,
  })
}
