import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useSettings } from '@/hooks/useSettings'

import { Segmented } from '@/components/segmented'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends string | number | boolean
    ? key
    : never
}[SettingsKey]

export type Props<K extends SettingsKey = Key> = SettingsInputBaseProps<
  K,
  'segmented'
> & {
  options: {
    label: string
    value: StorageItems[K]
    icon?: React.FC<React.ComponentProps<'svg'>>
  }[]
}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const { value, setValue } = useSettings(props.settingsKey)

  return (
    <Segmented
      className="py-2"
      size="sm"
      fullWidth
      label={props.label}
      selectedKey={JSON.stringify(value)}
      onSelectionChange={(key) => setValue(JSON.parse(key))}
      items={props.options.map(({ label, value, icon: Icon }) => ({
        key: JSON.stringify(value),
        children: label,
        startContent: Icon && <Icon className="size-4" />,
      }))}
    />
  )
}
