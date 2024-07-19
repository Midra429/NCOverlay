import { uid } from '@/utils/uid'
import { storagePageMessenger } from '@/utils/storage/page-messaging'
import { storage } from '@/utils/storage/extension'

const removeListeners: {
  [id: string]: (() => void) | undefined
} = {}

export default () => {
  storagePageMessenger.onMessage('get', ({ data }) => {
    return storage.get(...data)
  })

  storagePageMessenger.onMessage('set', ({ data }) => {
    return storage.set(...data)
  })

  storagePageMessenger.onMessage('remove', ({ data }) => {
    return storage.remove(...data)
  })

  storagePageMessenger.onMessage('getBytesInUse', ({ data }) => {
    return storage.getBytesInUse(...data)
  })

  storagePageMessenger.onMessage('onChange:register', ({ data: key }) => {
    const id = `${key}:${uid()}`

    removeListeners[id] = storage.onChange(key, (...args) => {
      storagePageMessenger
        .sendMessage('onChange:changed', [id, ...args])
        .catch(() => {})
    })

    return id
  })

  storagePageMessenger.onMessage('onChange:unregister', ({ data: id }) => {
    removeListeners[id]?.()
  })

  storagePageMessenger.onMessage('loadAndWatch:register', ({ data: key }) => {
    const id = `${key}:${uid()}`

    removeListeners[id] = storage.loadAndWatch(key, (...args) => {
      storagePageMessenger
        .sendMessage('loadAndWatch:changed', [id, ...args])
        .catch(() => {})
    })

    return id
  })

  storagePageMessenger.onMessage('loadAndWatch:unregister', ({ data: id }) => {
    removeListeners[id]?.()
  })
}
