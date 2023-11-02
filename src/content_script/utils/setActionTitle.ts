import type { WebExtMessageBody } from '@/types/webext/message'
import webext from '@/webext'

export const setActionTitle = (
  body: WebExtMessageBody['webext:action:title']
) => {
  webext.runtime.sendMessage<'webext:action:title'>({
    type: 'webext:action:title',
    body: body,
  })
}
