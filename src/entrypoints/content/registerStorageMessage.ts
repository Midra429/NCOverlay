import { uid } from '@midra/nco-utils/common/uid'

import { storage } from '@/utils/storage/extension'
import { onStorageMessage, sendStorageMessage } from '@/utils/storage/messaging'

const removeListenerMap = new Map<string, () => void>()

export default function () {
  onStorageMessage('get', ({ data }) => {
    return storage.get(...data)
  })

  onStorageMessage('set', ({ data }) => {
    return storage.set(...data)
  })

  onStorageMessage('remove', ({ data }) => {
    return storage.remove(...data)
  })

  onStorageMessage('getBytesInUse', ({ data }) => {
    return storage.getBytesInUse(...data)
  })

  onStorageMessage('onChange:register', ({ data: key }) => {
    const id = `${key}:${uid()}`

    const removeListener = storage.onChange(key, async (...args) => {
      try {
        await sendStorageMessage('onChange:changed', [id, ...args])
      } catch {}
    })

    removeListenerMap.set(id, removeListener)

    return id
  })

  onStorageMessage('onChange:unregister', ({ data: id }) => {
    removeListenerMap.get(id)?.()
  })

  onStorageMessage('watch:register', ({ data: key }) => {
    const id = `${key}:${uid()}`

    const removeListener = storage.watch(key, async (...args) => {
      try {
        await sendStorageMessage('watch:changed', [id, ...args])
      } catch {}
    })

    removeListenerMap.set(id, removeListener)

    return id
  })

  onStorageMessage('watch:unregister', ({ data: id }) => {
    removeListenerMap.get(id)?.()
  })
}
