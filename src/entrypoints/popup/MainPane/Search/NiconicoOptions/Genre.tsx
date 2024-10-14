import type { NiconicoGenre } from '@midra/nco-api/types/constants'
import type { SettingItems } from '@/types/storage'

import { cn } from '@nextui-org/react'
import { ShapesIcon } from 'lucide-react'
import { NICONICO_GENRES } from '@midra/nco-api/constants'

import { useSettings } from '@/hooks/useSettings'

import { Select, SelectSection, SelectItem } from '@/components/select'

const GENRES: SettingItems['settings:search:genre'][] = [
  '未指定',
  ...NICONICO_GENRES,
]

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
      <SelectSection className="mb-0" title="ジャンル">
        {GENRES.map((value) => (
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
      </SelectSection>
    </Select>
  )
}
