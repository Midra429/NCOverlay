import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { Input as NextUIInput } from '@nextui-org/react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends string ? key : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<K, 'text', {}>

export const Input: React.FC<Props> = (props) => {
  const [value, setValue] = useSettings(props.settingsKey)

  return (
    <NextUIInput
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
