import type { ChromeStorage } from '@/types/chrome/storage'

const get = async (
  keys: keyof ChromeStorage | (keyof ChromeStorage)[] | Partial<ChromeStorage>
): Promise<Partial<ChromeStorage>> => {
  return chrome.storage.local.get(keys)
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

export const ChromeStorageApi = {
  get,
  set,
  remove,
  clear,
}
