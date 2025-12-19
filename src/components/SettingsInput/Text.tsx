import type { SettingsKey, StorageItems } from '@/types/storage'
import type { SettingsConditional, SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Input as HeroUIInput } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

import { initConditional } from '.'

export type Key = {
  [P in SettingsKey]: StorageItems[P] extends string ? P : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'text'> {
  disable?: SettingsConditional
}

export function Input(props: Omit<Props, 'inputType'>) {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => initConditional(props.disable, setIsDisabled), [])

  return (
    <HeroUIInput
      classNames={{
        base: 'py-2',
        inputWrapper: 'border-1 border-divider shadow-none',
      }}
      labelPlacement="outside"
      label={props.label}
      description={props.description}
      isDisabled={isDisabled}
      value={value}
      onValueChange={setValue}
    />
  )
}
