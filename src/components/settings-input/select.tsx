import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { Select, SelectItem } from '@nextui-org/react'

import { useSettings } from '@/hooks/useSettings'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends string | number | boolean
    ? key
    : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<K, 'select'> & {
  options: {
    label: string
    value: StorageItems[K]
    icon?: React.FC<React.ComponentProps<'svg'>>
  }[]
}

export const Input: React.FC<Omit<Props, 'type'>> = (props) => {
  const { value, setValue } = useSettings(props.settingsKey)

  return (
    <Select
      classNames={{
        base: 'items-center justify-between py-2',
        label: 'flex-shrink-0 text-small',
        mainWrapper: 'w-32 transition-colors',
        value: 'flex flex-row items-center justify-center gap-2',
      }}
      size="sm"
      label={props.label}
      labelPlacement="outside-left"
      selectedKeys={[JSON.stringify(value)]}
      onSelectionChange={([key]) => setValue(key && JSON.parse(key as string))}
      renderValue={([{ props, rendered }]) => (
        <>
          {props?.startContent}
          <span>{rendered}</span>
        </>
      )}
    >
      {props.options.map(({ label, value, icon: Icon }) => (
        <SelectItem
          key={JSON.stringify(value)}
          startContent={Icon && <Icon className="size-4" />}
        >
          {label}
        </SelectItem>
      ))}
    </Select>
  )
}
