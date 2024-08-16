import type { StorageItems, SettingsKey } from '@/types/storage'

import { SETTINGS_DEFAULT } from '@/constants/settings/default'

import { useStorage } from './useStorage'

export const useSettings = <Key extends SettingsKey>(key: Key) => {
  return useStorage(key, SETTINGS_DEFAULT[key] as StorageItems[Key])
}
