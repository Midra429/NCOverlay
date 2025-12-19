import type { SettingsKey, StorageItems } from '@/types/storage'
import type { SettingsConditional, SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { Checkbox, CheckboxGroup, cn } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

import { initConditional } from '.'

export type Key = {
  [P in SettingsKey]: StorageItems[P] extends (string | number)[] ? P : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'checkcard'> {
  options: {
    label: string
    value: StorageItems[K][number]
    description?: string
  }[]
  disable?: SettingsConditional
}

export function Input(props: Omit<Props, 'inputType'>) {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => initConditional(props.disable, setIsDisabled), [])

  return (
    <CheckboxGroup
      classNames={{
        base: 'gap-2 py-2',
        label: 'text-foreground text-small',
        wrapper: 'gap-2',
      }}
      size="sm"
      orientation="vertical"
      label={props.label}
      isDisabled={isDisabled}
      value={value}
      onChange={setValue as any}
    >
      {props.options.map(({ label, description, value }) => (
        <Checkbox
          key={value}
          classNames={{
            base: [
              'gap-0.5',
              'min-h-12 w-full max-w-none',
              'm-0 px-2 py-1.5',
              'bg-default-100 hover:bg-default-200',
              'data-[selected=true]:bg-primary/15 dark:data-[selected=true]:bg-primary/20',
              'rounded-medium',
              'border-1 border-divider hover:border-default-400',
              'data-[selected=true]:border-primary',
              'transition-colors motion-reduce:transition-none',
              'cursor-pointer',
            ],
            wrapper: [
              'rounded-full',
              'before:rounded-full before:border-1 before:bg-default-50!',
              'after:rounded-full',
            ],
            label: 'flex w-full flex-col gap-0.5',
          }}
          value={value}
        >
          <span className="line-clamp-2 text-small">{label}</span>
          {description && (
            <span
              className={cn(
                'line-clamp-2 text-tiny',
                'text-foreground-500 dark:text-foreground-600'
              )}
            >
              {description}
            </span>
          )}
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
