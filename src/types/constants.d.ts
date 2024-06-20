import type { VODS, PLUGINS } from '@/constants'
import type { SettingsInputProps } from '@/components/settings-input'

export type VodKey = keyof typeof VODS

export type PluginKey = {
  [key in PluginVodKey]: `${key}:${PluginId<key>}`
}[PluginVodKey]

export type PluginVodKey = keyof typeof PLUGINS

export type PluginId<VodKey extends PluginVodKey> =
  (typeof PLUGINS)[VodKey][number]['id']

export type Plugins<VodKey extends PluginVodKey> = {
  [name in PluginId<VodKey>]: () => void
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
