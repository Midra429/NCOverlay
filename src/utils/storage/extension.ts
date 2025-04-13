import type { Storage as WxtStorage } from 'webextension-polyfill'
import type { StorageKey } from '@/types/storage'

import equal from 'fast-deep-equal'

import { webext } from '@/utils/webext'
import { WebExtStorage } from '.'

const extensionStorage = webext.storage.local

export const storage = new WebExtStorage({
  get: async (...keys: StorageKey[]) => {
    if (keys.length === 1) {
      const key = keys[0]
      const value: any = (await extensionStorage.get(key))[key]

      return value ?? null
    }

    return keys.length
      ? extensionStorage.get(Object.fromEntries(keys.map((key) => [key, null])))
      : extensionStorage.get()
  },

  set: async (key, value) => {
    if (value != null) {
      return extensionStorage.set({ [key]: value })
    } else {
      return extensionStorage.remove(key)
    }
  },

  remove: async (...keys: StorageKey[]) => {
    if (keys.length) {
      await extensionStorage.remove(keys)
    } else {
      await extensionStorage.clear()
    }
  },

  getBytesInUse(...keys: StorageKey[]) {
    switch (keys.length) {
      case 0:
        return extensionStorage.getBytesInUse(null)

      case 1:
        return extensionStorage.getBytesInUse(keys[0])

      default:
        return extensionStorage.getBytesInUse(keys)
    }
  },

  onChange(key, callback) {
    const onChangeCallback = ({
      [key]: change,
    }: WxtStorage.StorageAreaOnChangedChangesType) => {
      if (!change) return

      const current: any = change.newValue ?? null
      const prev: any = change.oldValue ?? null

      if (!equal(current, prev)) {
        callback(current, prev)
      }
    }

    extensionStorage.onChanged.addListener(onChangeCallback)

    return () => {
      extensionStorage.onChanged.removeListener(onChangeCallback)
    }
  },

  watch(key, callback) {
    let removeListener = () => {}

    this.get(key).then((value) => {
      callback(value)

      removeListener = this.onChange(key, (value) => {
        callback(value)
      })
    })

    return () => removeListener()
  },
})
