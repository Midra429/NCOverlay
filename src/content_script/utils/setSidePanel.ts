import type { WebExtMessageBody } from '@/types/webext/message'
import webext from '@/webext'

export const setSidePanel = (body: WebExtMessageBody['webext:side_panel']) => {
  webext.runtime.sendMessage<'webext:side_panel'>({
    type: 'webext:side_panel',
    body: body,
  })
}
