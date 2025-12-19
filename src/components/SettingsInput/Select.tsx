import type { SettingsKey, StorageItems } from '@/types/storage'
import type { SettingsConditional, SettingsInputBaseProps } from '.'

import { useEffect, useState } from 'react'
import { cn } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectItem } from '@/components/Select'

import { initConditional } from '.'

export type Key = {
  [P in SettingsKey]: StorageItems[P] extends string | number | boolean
    ? P
    : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'select'> {
  options: {
    label: string
    value: StorageItems[K]
    Icon?: (props: React.ComponentProps<'svg'>) => React.ReactNode
  }[]
  disable?: SettingsConditional
}

export function Input(props: Omit<Props, 'inputType'>) {
  const [value, setValue] = useSettings(props.settingsKey)
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => initConditional(props.disable, setIsDisabled), [])

  return (
    <div className="flex flex-col">
      <Select
        classNames={{
          base: 'py-2',
          mainWrapper: 'w-32',
        }}
        size="sm"
        label={props.label}
        labelPlacement="outside-left"
        isDisabled={isDisabled}
        selectedKeys={[JSON.stringify(value)]}
        onSelectionChange={([key]) =>
          setValue(key && JSON.parse(key as string))
        }
        renderValue={([{ props, rendered }]) => (
          <>
            {props?.startContent}
            <span>{rendered}</span>
          </>
        )}
      >
        {props.options.map(({ label, value, Icon }) => (
          <SelectItem
            key={JSON.stringify(value)}
            startContent={Icon && <Icon className="size-4" />}
          >
            {label}
          </SelectItem>
        ))}
      </Select>

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
