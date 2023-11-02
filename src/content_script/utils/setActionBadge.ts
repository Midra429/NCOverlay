import type { WebExtMessageBody } from '@/types/webext/message'
import webext from '@/webext'

export const setActionBadge = (
  body: WebExtMessageBody['webext:action:badge']
) => {
  webext.runtime.sendMessage<'webext:action:badge'>({
    type: 'webext:action:badge',
    body: body,
  })
}
