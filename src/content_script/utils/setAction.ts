import type { WebExtMessageBody } from '@/types/webext/message'
import webext from '@/webext'

export const setAction = (body: WebExtMessageBody['webext:action']) => {
  webext.runtime.sendMessage<'webext:action'>({
    type: 'webext:action',
    body: body,
  })
}
