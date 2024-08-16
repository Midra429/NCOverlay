import type { VOD_KEYS } from '@/constants/vods'
import type { PLUGINS } from '@/constants/plugins'
import type { SettingsInputProps } from '@/components/settings-input'

export type VodKey = (typeof VOD_KEYS)[number]

export type PluginKey = {
  [key in PluginVodKey]: `${key}:${PluginId<key>}`
}[PluginVodKey]

export type PluginVodKey = keyof typeof PLUGINS

export type PluginId<VodKey extends PluginVodKey> =
  (typeof PLUGINS)[VodKey][number]['id']

export type PluginFunction = () => () => void

export type Plugins<VodKey extends PluginVodKey> = {
  [id in PluginId<VodKey>]: PluginFunction
}

export type SettingsInitItem = {
  [type in keyof SettingsInputProps]: SettingsInputProps[type]
}[keyof SettingsInputProps]

export type SettingsInitData = {
  id: string
  title: string
  items: SettingsInitItem[]
  icon?: React.FC<React.ComponentProps<'svg'>>
}[]
