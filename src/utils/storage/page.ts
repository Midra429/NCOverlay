import type { StorageItems } from '@/types/storage'
import type {
  StorageGetFunction,
  StorageSetFunction,
  StorageRemoveFunction,
  StorageGetBytesInUseFunction,
} from '.'

import { WebExtStorage } from '.'
import { storagePageMessenger } from './page-messaging'

export const storage = new WebExtStorage({
  get: (...args: Parameters<StorageGetFunction>) => {
    return storagePageMessenger.sendMessage('get', args) as any
  },

  set: (...args: Parameters<StorageSetFunction>) => {
    return storagePageMessenger.sendMessage('set', args) as any
  },

  remove: (...args: Parameters<StorageRemoveFunction>) => {
    return storagePageMessenger.sendMessage('remove', args) as any
  },

  getBytesInUse: (...args: Parameters<StorageGetBytesInUseFunction>) => {
    return storagePageMessenger.sendMessage('getBytesInUse', args) as any
  },

  onChange: (key, callback) => {
    let unregister = () => {}

    storagePageMessenger.sendMessage('onChange:register', key).then((id) => {
      unregister = () => {
        storagePageMessenger.sendMessage('onChange:unregister', id)
      }

      storagePageMessenger.onMessage(
        'onChange:changed',
        ({ data: [changedId, ...changedValues] }) => {
          if (id !== changedId) return

          callback(
            ...(changedValues as [
              StorageItems[typeof key],
              StorageItems[typeof key],
            ])
          )
        }
      )
    })

    return () => unregister()
  },

  loadAndWatch: (key, callback) => {
    let unregister = () => {}

    storagePageMessenger
      .sendMessage('loadAndWatch:register', key)
      .then((id) => {
        unregister = () => {
          storagePageMessenger.sendMessage('loadAndWatch:unregister', id)
        }

        storagePageMessenger.onMessage(
          'loadAndWatch:changed',
          ({ data: [changedId, ...changedValues] }) => {
            if (id !== changedId) return

            callback(...(changedValues as [StorageItems[typeof key]]))
          }
        )
      })

    return () => unregister()
  },
})
