import type {
  ChromeStorage,
  ChromeStorageSettings,
} from '@/types/chrome/storage'
import { SETTINGS_DEFAULT } from '@/constants'

const get = async (
  keys: keyof ChromeStorage | (keyof ChromeStorage)[] | Partial<ChromeStorage>
) => {
  return chrome.storage.local.get(keys) as Promise<ChromeStorage>
}

const set = async (items: Partial<ChromeStorage>) => {
  return chrome.storage.local.set(items)
}

const remove = async (keys: keyof ChromeStorage | (keyof ChromeStorage)[]) => {
  return chrome.storage.local.remove(keys)
}

const clear = async () => {
  return chrome.storage.local.clear()
}

const getSettings = () => {
  return get(SETTINGS_DEFAULT) as Promise<ChromeStorageSettings>
}

export const ChromeStorageApi = {
  get,
  set,
  remove,
  clear,
  getSettings,
}
