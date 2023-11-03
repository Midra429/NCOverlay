import type { WebExtMessageType } from '@/types/webext/message'
import webext from '@/webext'

export const setAction = (body: WebExtMessageType['webext:action']['body']) => {
  webext.runtime.sendMessage({
    type: 'webext:action',
    body: body,
  })
}
