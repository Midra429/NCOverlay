import type { SettingsKey } from '@/types/storage'

import { SETTINGS_DEFAULT } from '@/constants/settings/default'

import { useStorage } from './useStorage'

export function useSettings<K extends SettingsKey>(key: K) {
  return useStorage(`settings:${key}`, SETTINGS_DEFAULT[key] as any)
}
