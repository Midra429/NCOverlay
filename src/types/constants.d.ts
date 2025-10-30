import type { SettingsKey } from '@/types/storage'
import type { VOD_KEYS } from '@/constants/vods'
import type { PLUGINS } from '@/constants/plugins'
import type { SettingsInputProps } from '@/components/SettingsInput'

export type VodKey = (typeof VOD_KEYS)[number]

export type PluginKey = {
  [key in PluginVodKey]: `${key}:${PluginId<key>}`
}[PluginVodKey]

export type PluginVodKey = keyof typeof PLUGINS

export type PluginId<K extends PluginVodKey> = (typeof PLUGINS)[K][number]['id']

export type PluginFunction = () => () => void

export type Plugins<K extends PluginVodKey> = {
  [id in PluginId<K>]: PluginFunction
}

export interface SettingsInitItem {
  id: string
  title: string
  items: SettingsInputProps<SettingsKey>[]
  Icon?: (props: React.ComponentProps<'svg'>) => React.ReactNode
}

export type SettingsInitData = SettingsInitItem[]
