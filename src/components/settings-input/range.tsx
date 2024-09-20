import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Slider } from '@nextui-org/react'

import { SETTINGS_DEFAULT } from '@/constants/settings/default'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends number ? key : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<K, 'range'> & {
  min: number
  max: number
  step: number
  prefix?: string
  suffix?: string
}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const [state, setState] = useState<number>(
    SETTINGS_DEFAULT[props.settingsKey]
  )
  const [value, setValue] = useSettings(props.settingsKey)

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
        value={state}
        getValue={
          props.prefix || props.suffix
            ? (val) => `${props.prefix || ''}${val}${props.suffix || ''}`
            : undefined
        }
        onChange={setState as any}
        onChangeEnd={setValue as any}
      />

      {props.description && (
        <span className="mb-2 whitespace-pre-wrap text-tiny text-foreground-400">
          {props.description}
        </span>
      )}
    </div>
  )
}
