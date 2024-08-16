import type { StorageItems } from '@/types/storage'
import type {
  StorageGetFunction,
  StorageSetFunction,
  StorageRemoveFunction,
  StorageGetBytesInUseFunction,
} from '.'

import { WebExtStorage } from '.'
import { storageMessenger } from './messaging'

export const storage = new WebExtStorage({
  get: (...args: Parameters<StorageGetFunction>) => {
    return storageMessenger.sendMessage('get', args) as any
  },

  set: (...args: Parameters<StorageSetFunction>) => {
    return storageMessenger.sendMessage('set', args) as any
  },

  remove: (...args: Parameters<StorageRemoveFunction>) => {
    return storageMessenger.sendMessage('remove', args) as any
  },

  getBytesInUse: (...args: Parameters<StorageGetBytesInUseFunction>) => {
    return storageMessenger.sendMessage('getBytesInUse', args) as any
  },

  onChange: (key, callback) => {
    let unregister = () => {}

    storageMessenger.sendMessage('onChange:register', key).then((id) => {
      unregister = () => {
        storageMessenger.sendMessage('onChange:unregister', id)
      }

      storageMessenger.onMessage(
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

  watch: (key, callback) => {
    let unregister = () => {}

    storageMessenger.sendMessage('watch:register', key).then((id) => {
      unregister = () => {
        storageMessenger.sendMessage('watch:unregister', id)
      }

      storageMessenger.onMessage(
        'watch:changed',
        ({ data: [changedId, ...changedValues] }) => {
          if (id !== changedId) return

          callback(...(changedValues as [StorageItems[typeof key]]))
        }
      )
    })

    return () => unregister()
  },
})
