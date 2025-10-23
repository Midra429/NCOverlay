import type { SearchQuerySort } from '@midra/nco-utils/types/api/niconico/search'

import { ArrowDownUpIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectSection, SelectItem } from '@/components/Select'

const SORT_OPTIONS: {
  label: string
  value: SearchQuerySort
}[] = [
  {
    label: '投稿日時が新しい順',
    value: '-startTime',
  },
  {
    label: '投稿日時が古い順',
    value: '+startTime',
  },
  {
    label: '再生数が多い順',
    value: '-viewCounter',
  },
  {
    label: '再生数が少ない順',
    value: '+viewCounter',
  },
  {
    label: 'コメント数が多い順',
    value: '-commentCounter',
  },
  {
    label: 'コメント数が少ない順',
    value: '+commentCounter',
  },
  {
    label: '再生時間が長い順',
    value: '-lengthSeconds',
  },
  {
    label: '再生時間が短い順',
    value: '+lengthSeconds',
  },
]

export interface SortProps {
  isDisabled?: boolean
}

export function Sort({ isDisabled }: SortProps) {
  const [value, setValue] = useSettings('settings:search:sort')

  return (
    <Select
      classNames={{
        base: 'shrink-4',
      }}
      size="mini"
      fullWidth
      label="並び替え"
      isDisabled={isDisabled}
      startContent={<ArrowDownUpIcon className="size-3.5" />}
      selectedKeys={[JSON.stringify(value)]}
      onSelectionChange={([key]) => setValue(key && JSON.parse(key as string))}
    >
      <SelectSection className="mb-0" title="並び替え">
        {SORT_OPTIONS.map(({ value, label }) => (
          <SelectItem
            key={JSON.stringify(value)}
            classNames={{
              base: 'gap-1 rounded-md px-1.5 py-1',
              title: 'text-tiny',
              selectedIcon: 'size-mini!',
            }}
          >
            {label}
          </SelectItem>
        ))}
      </SelectSection>
    </Select>
  )
}
