import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { cn } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectItem } from '@/components/Select'

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
}

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

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
