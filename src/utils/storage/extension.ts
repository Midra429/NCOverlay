import type { StorageKey } from '@/types/storage'
import type { StorageOnChangeCallback } from '.'

import { defineExtensionStorage } from '@webext-core/storage'
import equal from 'fast-deep-equal'
import { webext } from '@/utils/webext'
import { WebExtStorage } from '.'

const extensionStorage = defineExtensionStorage(webext.storage.local)

export const storage = new WebExtStorage({
  get: async (...keys: StorageKey[]) => {
    switch (keys.length) {
      case 0:
        return webext.storage.local.get() as any

      case 1:
        return extensionStorage.getItem(keys[0]) as any

      default:
        return Object.fromEntries(
          await Promise.all(
            keys.map(async (key) => {
              return [key, await extensionStorage.getItem(key)]
            })
          )
        ) as any
    }
  },

  set: async (key, value) => {
    if (value != null) {
      return extensionStorage.setItem(key, value)
    } else {
      return extensionStorage.removeItem(key)
    }
  },

  remove: async (...keys: StorageKey[]) => {
    switch (keys.length) {
      case 0:
        await extensionStorage.clear()
        break

      default:
        await Promise.all(
          keys.map((key) => {
            return extensionStorage.removeItem(key)
          })
        )
        break
    }
  },

  getBytesInUse(...keys: StorageKey[]) {
    switch (keys.length) {
      case 0:
        return webext.storage.local.getBytesInUse(null)

      case 1:
        return webext.storage.local.getBytesInUse(keys[0])

      default:
        return webext.storage.local.getBytesInUse(keys)
    }
  },

  onChange(key, callback) {
    const onChangeCallback: StorageOnChangeCallback<any> = (
      newValue: any,
      oldValue: any
    ) => {
      const current = newValue ?? null
      const prev = oldValue ?? null

      if (!equal(current, prev)) {
        callback(current, prev)
      }
    }

    return extensionStorage.onChange(key, onChangeCallback)
  },

  loadAndWatch(key, callback) {
    this.get(key).then(callback)

    return this.onChange!(key, (value) => {
      callback(value)
    })
  },
})
