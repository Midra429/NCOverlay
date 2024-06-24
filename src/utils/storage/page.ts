import type {
  StorageGetFunction,
  StorageRemoveFunction,
  StorageSetFunction,
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

  onChange: null,

  loadAndWatch: null,
})
