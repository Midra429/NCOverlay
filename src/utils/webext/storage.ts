import type {
  WebExtStorage,
  WebExtStorageSettings,
} from '@/types/webext/storage'
import webext from '@/webext'
import { SETTINGS_DEFAULT } from '@/constants'

const get = async (
  keys: keyof WebExtStorage | (keyof WebExtStorage)[] | Partial<WebExtStorage>
) => {
  return webext.storage.local.get(keys) as Promise<WebExtStorage>
}

const set = async (items: Partial<WebExtStorage>) => {
  return webext.storage.local.set(items)
}

const remove = async (keys: keyof WebExtStorage | (keyof WebExtStorage)[]) => {
  return webext.storage.local.remove(keys)
}

const clear = async () => {
  return webext.storage.local.clear()
}

const getSettings = () => {
  return get(SETTINGS_DEFAULT) as Promise<WebExtStorageSettings>
}

const clearSettings = async () => {
  await clear()
  return set(SETTINGS_DEFAULT)
}

export const WebExtStorageApi = {
  get,
  set,
  remove,
  clear,
  getSettings,
  clearSettings,
}
