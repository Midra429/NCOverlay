import type { SearchQuerySort } from '@midra/nco-api/types/niconico/search'

import { Select, SelectItem, cn } from '@nextui-org/react'
import { ArrowDownUpIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

const SORT_OPTIONS: {
  label: string
  value: SearchQuerySort
}[] = [
  { label: '投稿日時が新しい順', value: '-startTime' },
  { label: '投稿日時が古い順', value: '+startTime' },
  { label: '再生数が多い順', value: '-viewCounter' },
  { label: '再生数が少ない順', value: '+viewCounter' },
  { label: 'コメント数が多い順', value: '-commentCounter' },
  { label: 'コメント数が少ない順', value: '+commentCounter' },
  { label: '再生時間が長い順', value: '-lengthSeconds' },
  { label: '再生時間が短い順', value: '+lengthSeconds' },
]

export const Sort: React.FC = () => {
  const { value, setValue } = useSettings('settings:search:sort')

  return (
    <Select
      classNames={{
        base: 'shrink-[2]',
        trigger: cn(
          'h-6 min-h-6 px-1.5',
          'border-1 border-divider',
          'shadow-none'
        ),
        selectorIcon: 'end-1.5',
        value: 'text-mini',
        popoverContent: 'rounded-md',
        listbox: 'p-0',
      }}
      size="sm"
      fullWidth
      startContent={
        <ArrowDownUpIcon className="size-medium shrink-0 text-foreground-500" />
      }
      selectedKeys={[JSON.stringify(value)]}
      onSelectionChange={([key]) => setValue(key && JSON.parse(key as string))}
    >
      {SORT_OPTIONS.map(({ value, label }) => (
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
