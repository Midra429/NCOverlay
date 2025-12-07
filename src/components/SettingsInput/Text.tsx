import type { SettingsKey, StorageItems } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { Input as HeroUIInput } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [P in SettingsKey]: StorageItems[P] extends string ? P : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'text'> {}

export function Input(props: Omit<Props, 'inputType'>) {
  const [value, setValue] = useSettings(props.settingsKey)

  return (
    <HeroUIInput
      classNames={{
        base: 'py-2',
        inputWrapper: 'border-1 border-divider shadow-none',
      }}
      labelPlacement="outside"
      label={props.label}
      description={props.description}
      value={value}
      onValueChange={setValue}
    />
  )
}
