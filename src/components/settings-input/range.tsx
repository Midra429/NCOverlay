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
  const { value, setValue } = useSettings(props.settingsKey)

  useEffect(() => setState(value), [value])

  return (
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
      onChange={(val) => setState(val as number)}
      onChangeEnd={(val) => setValue(val as number)}
    />
  )
}
