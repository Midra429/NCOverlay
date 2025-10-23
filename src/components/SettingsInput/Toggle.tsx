import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { Switch } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends boolean ? key : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'toggle'> {}

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

  return (
    <Switch
      classNames={{
        base: [
          'flex flex-row-reverse justify-between gap-2',
          'w-full max-w-full py-2',
          'overflow-hidden',
        ],
        wrapper: 'm-0',
        label: 'm-0',
      }}
      size="sm"
      isSelected={value}
      onValueChange={setValue}
    >
      <ItemLabel title={props.label} description={props.description} />
    </Switch>
  )
}
