import type { NiconicoGenre } from '@midra/nco-api/types/constants'

import { cn } from '@nextui-org/react'
import { ShapesIcon } from 'lucide-react'
import { NICONICO_GENRES } from '@midra/nco-api/constants'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectItem } from '@/components/select'

export type GenreProps = {
  isDisabled?: boolean
}

export const Genre: React.FC<GenreProps> = ({ isDisabled }) => {
  const [value, setValue] = useSettings('settings:search:genre')

  return (
    <Select
      classNames={{
        base: 'shrink-[4]',
      }}
      size="mini"
      fullWidth
      label="ジャンル"
      isDisabled={isDisabled}
      startContent={
        <ShapesIcon
          className={cn(
            'size-small shrink-0',
            'text-foreground-500 dark:text-foreground-600'
          )}
        />
      }
      selectedKeys={[value]}
      onSelectionChange={([key]) => setValue(key as NiconicoGenre)}
    >
      {['未指定', ...NICONICO_GENRES].map((value) => (
        <SelectItem
          key={value}
          classNames={{
            base: 'gap-1 rounded-md px-1.5 py-1',
            title: 'text-tiny',
            selectedIcon: '!size-mini',
          }}
          variant="flat"
        >
          {value}
        </SelectItem>
      ))}
    </Select>
  )
}
