import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { Tooltip, CheckboxGroup, Checkbox, cn } from '@nextui-org/react'
import { CircleHelpIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends (string | number)[]
    ? key
    : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'checkbox'
> & {
  options: {
    label: string
    value: StorageItems[K][number]
  }[]
}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const { value, setValue } = useSettings(props.settingsKey)

  return (
    <CheckboxGroup
      classNames={{
        base: 'gap-0 py-2',
        label: 'my-1 text-small text-foreground',
        wrapper: 'my-1 gap-1.5',
      }}
      size="sm"
      orientation="horizontal"
      label={
        <div className="flex flex-row items-center justify-between">
          <span>{props.label}</span>
          {props.description && (
            <Tooltip
              classNames={{
                base: 'pointer-events-none',
                content: 'whitespace-pre-wrap',
              }}
              placement="left"
              size="sm"
              radius="sm"
              color="foreground"
              showArrow
              closeDelay={0}
              content={props.description}
            >
              <CircleHelpIcon
                className="text-foreground-400"
                size={18}
                cursor="help"
              />
            </Tooltip>
          )}
        </div>
      }
      value={value}
      onChange={(val) => setValue(val as any)}
    >
      {props.options.map(({ label, value }, idx) => (
        <Checkbox
          key={idx}
          classNames={{
            base: cn(
              'flex-1',
              'm-0 min-w-fit max-w-none',
              'cursor-pointer',
              'rounded-full border-2 border-transparent',
              'data-[selected=true]:border-primary',
              'bg-default-100 px-1.5 py-1',
              'hover:bg-default-200'
            ),
            wrapper: cn(
              'm-0 rounded-full',
              'before:rounded-full before:!bg-content2',
              'after:rounded-full'
            ),
            label: 'flex w-full flex-row',
          }}
          value={value}
        >
          <div className="w-full min-w-2" />
          <span className="line-clamp-1 max-w-full flex-shrink-0">{label}</span>
          <div className="w-full min-w-1" />
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
