import type { SettingItems } from '@/types/storage'

import { Select, SelectItem, cn } from '@nextui-org/react'
import { ClockIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

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

export const LengthRange: React.FC = () => {
  const [value, setValue] = useSettings('settings:search:lengthRange')

  return (
    <Select
      classNames={{
        base: 'shrink-[3]',
        label: 'hidden',
        trigger: cn(
          'h-6 min-h-6 px-1.5',
          'border-1 border-divider',
          'shadow-none'
        ),
        innerWrapper: '!pt-0',
        selectorIcon: 'end-1.5',
        value: 'text-mini',
        popoverContent: 'rounded-md',
        listbox: 'p-0',
      }}
      size="sm"
      fullWidth
      label="再生時間"
      startContent={
        <ClockIcon className="size-medium shrink-0 text-foreground-500" />
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
        >
          {label}
        </SelectItem>
      ))}
    </Select>
  )
}
