import type { StorageItems } from '@/types/storage'
import type {
  StorageGetBytesInUseFunction,
  StorageGetFunction,
  StorageRemoveFunction,
  StorageSetFunction,
} from '.'

import { WebExtStorage } from '.'
import { onStorageMessage, sendStorageMessage } from './messaging'

export const storage = new WebExtStorage({
  get: (...args: Parameters<StorageGetFunction>) => {
    return sendStorageMessage('get', args) as any
  },

  set: (...args: Parameters<StorageSetFunction>) => {
    return sendStorageMessage('set', args) as any
  },

  remove: (...args: Parameters<StorageRemoveFunction>) => {
    return sendStorageMessage('remove', args) as any
  },

  getBytesInUse: (...args: Parameters<StorageGetBytesInUseFunction>) => {
    return sendStorageMessage('getBytesInUse', args) as any
  },

  onChange: (key, callback) => {
    let unregister = () => {}

    sendStorageMessage('onChange:register', key).then((id) => {
      unregister = () => {
        sendStorageMessage('onChange:unregister', id)
      }

      onStorageMessage(
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

    sendStorageMessage('watch:register', key).then((id) => {
      unregister = () => {
        sendStorageMessage('watch:unregister', id)
      }

      onStorageMessage(
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
