import type { StorageItems, SettingsKey } from '@/types/storage'

import { SETTINGS_DEFAULT } from '@/constants/settings/default'

import { useStorage } from './useStorage'

export function useSettings<K extends SettingsKey>(key: K) {
  return useStorage(key, SETTINGS_DEFAULT[key] as StorageItems[K])
}
