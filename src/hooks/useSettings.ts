import type { SettingsKey, StorageItems } from '@/types/storage'

import { useStorage } from './useStorage'
import { SETTINGS_DEFAULT } from '@/constants/settings/default'

export function useSettings<K extends SettingsKey>(key: K) {
  return useStorage(key, SETTINGS_DEFAULT[key] as StorageItems[K])
}
