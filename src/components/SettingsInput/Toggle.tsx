import type { SettingsKey, StorageItems } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Switch } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

import { ItemLabel } from '@/components/ItemLabel'

import { initConditional } from '.'

export type Key = {
  [P in SettingsKey]: StorageItems[P] extends boolean ? P : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'toggle'> {}

export function Input(props: Omit<Props, 'inputType'>) {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => initConditional(props.disable, setIsDisabled), [])

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
      isDisabled={isDisabled}
      isSelected={value}
      onValueChange={setValue}
    >
      <ItemLabel title={props.label} description={props.description} />
    </Switch>
  )
}
