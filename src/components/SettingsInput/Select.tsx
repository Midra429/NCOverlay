import type { StorageItems, SettingsKey } from '@/types/storage'
import type { SettingsInputBaseProps } from '.'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectItem } from '@/components/Select'

export type Key = {
  [key in SettingsKey]: StorageItems[key] extends string | number | boolean
    ? key
    : never
}[SettingsKey]

export type Props<K extends Key = Key> = SettingsInputBaseProps<
  K,
  'select',
  {
    options: {
      label: string
      value: StorageItems[K]
      icon?: React.FC<React.ComponentProps<'svg'>>
    }[]
  }
>

export const Input: React.FC<Props> = (props) => {
  const [value, setValue] = useSettings(props.settingsKey)

  return (
    <Select
      classNames={{
        base: 'py-2',
        mainWrapper: 'w-32',
      }}
      size="sm"
      label={props.label}
      labelPlacement="outside-left"
      description={props.description}
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
