import { uid } from '@midra/nco-utils/common/uid'

import { storage } from '@/utils/storage/extension'
import { storageMessenger } from '@/utils/storage/messaging'

const removeListenerMap = new Map<string, () => void>()

export default function () {
  storageMessenger.onMessage('get', ({ data }) => {
    return storage.get(...data)
  })

  storageMessenger.onMessage('set', ({ data }) => {
    return storage.set(...data)
  })

  storageMessenger.onMessage('remove', ({ data }) => {
    return storage.remove(...data)
  })

  storageMessenger.onMessage('getBytesInUse', ({ data }) => {
    return storage.getBytesInUse(...data)
  })

  storageMessenger.onMessage('onChange:register', ({ data: key }) => {
    const id = `${key}:${uid()}`

    const removeListener = storage.onChange(key, async (...args) => {
      try {
        await storageMessenger.sendMessage('onChange:changed', [id, ...args])
      } catch {}
    })

    removeListenerMap.set(id, removeListener)

    return id
  })

  storageMessenger.onMessage('onChange:unregister', ({ data: id }) => {
    removeListenerMap.get(id)?.()
  })

  storageMessenger.onMessage('watch:register', ({ data: key }) => {
    const id = `${key}:${uid()}`

    const removeListener = storage.watch(key, async (...args) => {
      try {
        await storageMessenger.sendMessage('watch:changed', [id, ...args])
      } catch {}
    })

    removeListenerMap.set(id, removeListener)

    return id
  })

  storageMessenger.onMessage('watch:unregister', ({ data: id }) => {
    removeListenerMap.get(id)?.()
  })
}
