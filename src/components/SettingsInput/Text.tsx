import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { Input as HeroUIInput } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends string ? key : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<K, 'text', {}>

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

  return (
    <HeroUIInput
      classNames={{
        base: 'py-2',
        inputWrapper: 'border-divider border-1 shadow-none',
      }}
      labelPlacement="outside"
      label={props.label}
      description={props.description}
      value={value}
      onValueChange={setValue}
    />
  )
}
