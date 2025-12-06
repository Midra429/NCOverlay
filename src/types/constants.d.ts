import type { SettingsInputProps } from '@/components/SettingsInput'
import type { PLUGINS } from '@/constants/plugins'
import type { VOD_KEYS } from '@/constants/vods'
import type { SettingsKey } from '@/types/storage'

export type VodKey = (typeof VOD_KEYS)[number]

export type PluginKey = {
  [P in PluginVodKey]: `${P}:${PluginId<P>}`
}[PluginVodKey]

export type PluginVodKey = keyof typeof PLUGINS

export type PluginId<K extends PluginVodKey> = (typeof PLUGINS)[K][number]['id']

export type PluginFunction = () => () => void

export type Plugins<K extends PluginVodKey> = {
  [P in PluginId<K>]: PluginFunction
}

export interface SettingsInitItem {
  title: string
  items: SettingsInputProps<SettingsKey>[]
  Icon?: (props: React.ComponentProps<'svg'>) => React.ReactNode
}

export type SettingsInitData = SettingsInitItem[]
