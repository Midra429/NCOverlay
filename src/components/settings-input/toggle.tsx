import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { Switch, cn } from '@nextui-org/react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends boolean ? key : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'toggle'
> & {}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const { value, setValue } = useSettings(props.settingsKey)

  return (
    <Switch
      classNames={{
        base: cn(
          'flex flex-row-reverse justify-between gap-2',
          'w-full max-w-full py-2',
          'overflow-hidden'
        ),
        wrapper: 'm-0',
      }}
      size="sm"
      isSelected={value}
      onValueChange={(val) => setValue(val)}
    >
      <div className="flex flex-col gap-0.5">
        <span>{props.label}</span>
        {props.description && (
          <span className="line-clamp-2 text-tiny text-foreground-400">
            {props.description}
          </span>
        )}
      </div>
    </Switch>
  )
}
