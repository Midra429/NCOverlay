import type { ContentScriptContext } from 'wxt/client'

import { storagePageMessenger } from '@/utils/storage/page-messaging'
import { storage } from '@/utils/storage/extension'

export default (ctx: ContentScriptContext) => {
  storagePageMessenger.onMessage('get', ({ data }) => {
    return storage.get(...data)
  })

  storagePageMessenger.onMessage('set', ({ data }) => {
    return storage.set(...data)
  })

  storagePageMessenger.onMessage('remove', ({ data }) => {
    return storage.remove(...data)
  })

  ctx.onInvalidated(() => {
    storagePageMessenger.removeAllListeners()
  })
}
