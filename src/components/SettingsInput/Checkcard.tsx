import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { CheckboxGroup, Checkbox, cn } from '@heroui/react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends (string | number)[]
    ? key
    : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'checkcard',
  {
    options: {
      label: string
      value: StorageItems[K][number]
      description?: string
    }[]
  }
>

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

  return (
    <CheckboxGroup
      classNames={{
        base: 'gap-2 py-2',
        label: 'text-small text-foreground',
        wrapper: 'gap-2',
      }}
      size="sm"
      orientation="vertical"
      label={props.label}
      value={value}
      onChange={setValue as any}
    >
      {props.options.map(({ label, description, value }, idx) => (
        <Checkbox
          key={idx}
          classNames={{
            base: [
              'gap-0.5',
              'min-h-12 w-full max-w-none',
              'm-0 px-2 py-1.5',
              'bg-default-100 hover:bg-default-200',
              'data-[selected=true]:bg-primary/15 dark:data-[selected=true]:bg-primary/20',
              'rounded-medium',
              'border-divider hover:border-default-400 border-1',
              'data-[selected=true]:border-primary',
              'transition-colors motion-reduce:transition-none',
              'cursor-pointer',
            ],
            wrapper: [
              'rounded-full',
              'before:!bg-default-50 before:rounded-full before:border-1',
              'after:rounded-full',
            ],
            label: 'flex w-full flex-col gap-0.5',
          }}
          value={value}
        >
          <span className="text-small line-clamp-2">{label}</span>
          {description && (
            <span
              className={cn(
                'text-tiny line-clamp-2',
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
