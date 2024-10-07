import type { SettingItems } from '@/types/storage'

import { cn } from '@nextui-org/react'
import { ClockIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectItem } from '@/components/select'

const LENGTH_RANGE_OPTIONS: {
  label: string
  value: SettingItems['settings:search:lengthRange']
}[] = [
  { label: '指定なし', value: [null, null] },
  { label: '5分以内', value: [null, 60 * 5] },
  { label: '10分以内', value: [null, 60 * 10] },
  { label: '20分以上', value: [60 * 20, null] },
  { label: '1時間以上', value: [60 * 60, null] },
]

export type LengthRangeProps = {
  isDisabled?: boolean
}

export const LengthRange: React.FC<LengthRangeProps> = ({ isDisabled }) => {
  const [value, setValue] = useSettings('settings:search:lengthRange')

  return (
    <Select
      classNames={{
        base: 'shrink-[3]',
      }}
      size="mini"
      fullWidth
      label="再生時間"
      isDisabled={isDisabled}
      startContent={
        <ClockIcon
          className={cn(
            'size-small shrink-0',
            'text-foreground-500 dark:text-foreground-600'
          )}
        />
      }
      selectedKeys={[JSON.stringify(value)]}
      onSelectionChange={([key]) => setValue(key && JSON.parse(key as string))}
    >
      {LENGTH_RANGE_OPTIONS.map(({ value, label }) => (
        <SelectItem
          key={JSON.stringify(value)}
          classNames={{
            base: 'gap-1 rounded-md px-1.5 py-1',
            title: 'text-tiny',
            selectedIcon: '!size-mini',
          }}
          variant="flat"
        >
          {label}
        </SelectItem>
      ))}
    </Select>
  )
}
