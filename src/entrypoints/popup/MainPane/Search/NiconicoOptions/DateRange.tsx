import type { SettingItems } from '@/types/storage'

import { CalendarDaysIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectSection, SelectItem } from '@/components/Select'

const DATE_RANGE_OPTIONS: {
  label: string
  value: SettingItems['settings:search:dateRange']
}[] = [
  {
    label: '未指定',
    value: [null, null],
  },
  {
    label: '24時間以内',
    value: [{ days: -1 }, null],
  },
  {
    label: '1週間以内',
    value: [{ weeks: -1 }, null],
  },
  {
    label: '1ヶ月以内',
    value: [{ months: -1 }, null],
  },
  {
    label: '1年以内',
    value: [{ years: -1 }, null],
  },
]

export type DateRangeProps = {
  isDisabled?: boolean
}

export function DateRange({ isDisabled }: DateRangeProps) {
  const [value, setValue] = useSettings('settings:search:dateRange')

  return (
    <Select
      classNames={{
        base: 'shrink-[5]',
      }}
      size="mini"
      fullWidth
      label="投稿日時"
      isDisabled={isDisabled}
      startContent={<CalendarDaysIcon className="size-3.5" />}
      selectedKeys={[JSON.stringify(value)]}
      onSelectionChange={([key]) => setValue(key && JSON.parse(key as string))}
    >
      <SelectSection className="mb-0" title="投稿日時">
        {DATE_RANGE_OPTIONS.map(({ value, label }) => (
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
      </SelectSection>
    </Select>
  )
}
