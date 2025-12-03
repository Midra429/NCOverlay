import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { CheckboxGroup, Checkbox } from '@heroui/react'
import { CircleHelpIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

import { Tooltip } from '@/components/Tooltip'

export type Key = {
  [P in SettingsKey]: StorageItems[P] extends (string | number)[] ? P : never
}[SettingsKey]

export interface Props<K extends Key = Key>
  extends SettingsInputBaseProps<K, 'checkbox'> {
  options: {
    label: string
    value: StorageItems[K][number]
  }[]
}

export function Input(props: Props) {
  const [value, setValue] = useSettings(props.settingsKey)

  return (
    <CheckboxGroup
      classNames={{
        base: 'gap-2 py-2',
        label: 'text-foreground text-small',
        wrapper: 'gap-x-[5px] gap-y-1.5',
      }}
      size="sm"
      orientation="horizontal"
      label={
        <div className="flex flex-row items-center justify-between">
          <span>{props.label}</span>
          {props.description && (
            <Tooltip placement="left" content={props.description}>
              <CircleHelpIcon
                className="text-foreground-500 dark:text-foreground-600"
                size={18}
                cursor="help"
              />
            </Tooltip>
          )}
        </div>
      }
      value={value}
      onChange={setValue as any}
    >
      {props.options.map(({ label, value }) => (
        <Checkbox
          key={value}
          classNames={{
            base: [
              'flex-1',
              'min-w-fit max-w-none',
              'm-0 px-1.5 py-1',
              'bg-default-100 hover:bg-default-200',
              'data-[selected=true]:bg-primary/15 dark:data-[selected=true]:bg-primary/20',
              'rounded-full',
              'border-1 border-divider hover:border-default-400',
              'data-[selected=true]:border-primary',
              'transition-colors motion-reduce:transition-none',
              'cursor-pointer',
            ],
            wrapper: [
              'm-0 rounded-full',
              'before:rounded-full before:border-1 before:bg-default-50!',
              'after:rounded-full',
            ],
            label: 'flex w-full flex-row',
          }}
          value={value}
        >
          <div className="w-full min-w-2" />
          <span className="line-clamp-1 max-w-full shrink-0">{label}</span>
          <div className="w-full min-w-1" />
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
