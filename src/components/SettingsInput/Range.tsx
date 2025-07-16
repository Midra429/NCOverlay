import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Slider, cn } from '@heroui/react'

import { SETTINGS_DEFAULT } from '@/constants/settings/default'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends number ? key : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'range',
  {
    min: number
    max: number
    step: number
    prefix?: string
    suffix?: string
  }
>

export const Input: React.FC<Props> = (props) => {
  const [state, setState] = useState<number>(
    SETTINGS_DEFAULT[props.settingsKey]
  )
  const [value, setValue] = useSettings(props.settingsKey)

  const [useNiconicoCredentials] = useSettings(
    'settings:comment:useNiconicoCredentials'
  )

  const isDisabled =
    props.settingsKey === 'settings:comment:amount' && !useNiconicoCredentials

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
            'text-tiny mb-2 whitespace-pre-wrap',
            'text-foreground-500 dark:text-foreground-600'
          )}
        >
          {props.description}
        </span>
      )}
    </div>
  )
}
