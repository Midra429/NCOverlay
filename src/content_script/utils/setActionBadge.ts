import type { WebExtMessageType } from '@/types/webext/message'
import webext from '@/webext'

export const setActionBadge = (
  body: WebExtMessageType['webext:action:badge']['body']
) => {
  webext.runtime.sendMessage({
    type: 'webext:action:badge',
    body: body,
  })
}
