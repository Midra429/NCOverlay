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
  const { value, setValue } = useSettings(props.settingsKey)

  return (
    <CheckboxGroup
      classNames={{
        base: 'gap-0 py-2',
        label: 'my-1 text-small text-foreground',
        wrapper: 'my-1 gap-2',
      }}
      size="sm"
      orientation="vertical"
      label={props.label}
      value={value}
      onChange={(val) => setValue(val as any)}
    >
      {props.options.map(({ label, description, value }, idx) => (
        <Checkbox
          key={idx}
          classNames={{
            base: cn(
              'flex flex-row gap-x-0.5',
              'm-0 min-h-14 w-full max-w-none',
              'cursor-pointer',
              'rounded-medium border-2 border-transparent',
              'data-[selected=true]:border-primary',
              'bg-default-100 px-2 py-1.5',
              'hover:bg-default-200'
            ),
            wrapper: cn(
              'rounded-full',
              'before:rounded-full before:!bg-content2',
              'after:rounded-full'
            ),
            label: 'w-full',
          }}
          value={value}
        >
          <div className="flex flex-col gap-0.5">
            <span className="line-clamp-2 text-small">{label}</span>
            {description && (
              <span className="line-clamp-2 text-tiny text-foreground-500">
                {description}
              </span>
            )}
          </div>
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
