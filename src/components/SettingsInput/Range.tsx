import type { SettingsKey, StorageItems } from '@/types/storage'
import type { SettingsConditional, SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Slider, cn } from '@heroui/react'

import { SETTINGS_DEFAULT } from '@/constants/settings/default'
import { useSettings } from '@/hooks/useSettings'

import { initConditional } from '.'

export type Key = {
  [P in SettingsKey]: StorageItems[P] extends number ? P : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'range'> {
  min: number
  max: number
  step: number
  prefix?: string
  suffix?: string
  disable?: SettingsConditional
}

export function Input(props: Omit<Props, 'inputType'>) {
  const [state, setState] = useState<number>(
    SETTINGS_DEFAULT[props.settingsKey]
  )
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => initConditional(props.disable, setIsDisabled), [])

  useEffect(() => {
    setState(value)
  }, [value])

  return (
    <div className="flex flex-col">
      <Slider
        classNames={{
          base: 'overflow-hidden py-2',
        }}
        size="md"
        label={props.label}
        minValue={props.min}
        maxValue={props.max}
        step={props.step}
        showSteps={(props.max - props.min) / props.step <= 10}
        isDisabled={isDisabled}
        value={isDisabled ? SETTINGS_DEFAULT[props.settingsKey] : state}
        getValue={
          props.prefix || props.suffix
            ? (val) => `${props.prefix || ''}${val}${props.suffix || ''}`
            : undefined
        }
        onChange={setState as any}
        onChangeEnd={setValue as any}
      />

      {props.description && (
        <span
          className={cn(
            'mb-2 whitespace-pre-wrap text-tiny',
            'text-foreground-500 dark:text-foreground-600'
          )}
        >
          {props.description}
        </span>
      )}
    </div>
  )
}
