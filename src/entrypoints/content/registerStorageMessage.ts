import { uid } from '@/utils/uid'
import { storage } from '@/utils/storage/extension'
import { storageMessenger } from '@/utils/storage/messaging'

const removeListeners: {
  [id: string]: (() => void) | undefined
} = {}

export default () => {
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

    removeListeners[id] = storage.onChange(key, (...args) => {
      storageMessenger
        .sendMessage('onChange:changed', [id, ...args])
        .catch(() => {})
    })

    return id
  })

  storageMessenger.onMessage('onChange:unregister', ({ data: id }) => {
    removeListeners[id]?.()
  })

  storageMessenger.onMessage('loadAndWatch:register', ({ data: key }) => {
    const id = `${key}:${uid()}`

    removeListeners[id] = storage.loadAndWatch(key, (...args) => {
      storageMessenger
        .sendMessage('loadAndWatch:changed', [id, ...args])
        .catch(() => {})
    })

    return id
  })

  storageMessenger.onMessage('loadAndWatch:unregister', ({ data: id }) => {
    removeListeners[id]?.()
  })
}
