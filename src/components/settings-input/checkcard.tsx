import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { CheckboxGroup, Checkbox, cn } from '@nextui-org/react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends (string | number)[]
    ? key
    : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'checkcard'
> & {
  options: {
    label: string
    value: StorageItems[K][number]
    description?: string
  }[]
}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
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
            base: cn(
              'flex flex-row gap-0.5',
              'm-0 min-h-12 w-full max-w-none',
              'px-2 py-1.5',
              'bg-default-100 hover:bg-default-200',
              'rounded-medium',
              'border-1 border-divider hover:border-default-400',
              'data-[selected=true]:border-primary',
              'transition-colors motion-reduce:transition-none',
              'cursor-pointer'
            ),
            wrapper: cn(
              'rounded-full',
              'before:rounded-full before:border-1 before:!bg-default-50',
              'after:rounded-full'
            ),
            label: 'w-full',
          }}
          value={value}
        >
          <div className="flex flex-col gap-0.5">
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
          </div>
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
