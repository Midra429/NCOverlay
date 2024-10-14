import type {
  SyoboCalTitleMedium,
  SyoboCalTitleSearch,
} from '@midra/nco-api/types/syobocal/json'

import { useMemo } from 'react'
import { Button, cn } from '@nextui-org/react'
import { useOverflowDetector } from 'react-detectable-overflow'
import { CalendarDaysIcon, ShapesIcon, ChevronRightIcon } from 'lucide-react'
import { SYOBOCAL_CATEGORIES } from '@midra/nco-api/constants'

export type ScTitleItem = SyoboCalTitleMedium | SyoboCalTitleSearch

export type TitleItemInnerProps = {
  item: ScTitleItem
  isHeader?: boolean
}

export const TitleItemInner: React.FC<TitleItemInnerProps> = ({
  item,
  isHeader,
}) => {
  const { ref, overflow } = useOverflowDetector()

  const period = useMemo(() => {
    const start = `${item.FirstYear}年${item.FirstMonth}月`

    const end = [
      item.FirstEndYear &&
        item.FirstEndYear !== item.FirstYear &&
        `${item.FirstEndYear}年`,
      item.FirstEndMonth && `${item.FirstEndMonth}月`,
    ]
      .filter(Boolean)
      .join('')

    return [start, end].filter(Boolean).join('〜')
  }, [item.FirstYear, item.FirstMonth, item.FirstEndYear, item.FirstEndMonth])

  const category = useMemo(() => {
    return SYOBOCAL_CATEGORIES[item.Cat]?.replace('/再放送', '')
  }, [item.Cat])

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={cn(
          'font-bold',
          'line-clamp-2 break-all',
          isHeader ? 'text-medium' : 'text-tiny'
        )}
        title={overflow ? item.Title : undefined}
        ref={ref}
      >
        {item.Title}
      </span>

      <div
        className={cn(
          'flex flex-row gap-4',
          'font-normal',
          'text-foreground-500 dark:text-foreground-600'
        )}
      >
        {period && (
          <div className="flex flex-row items-center gap-1">
            <CalendarDaysIcon
              className={isHeader ? 'size-small' : 'size-tiny'}
            />
            <span className={isHeader ? 'text-small' : 'text-tiny'}>
              {period}
            </span>
          </div>
        )}

        {category && (
          <div className="flex flex-row items-center gap-1">
            <ShapesIcon className={isHeader ? 'size-small' : 'size-tiny'} />
            <span className={isHeader ? 'text-small' : 'text-tiny'}>
              {category}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export type TitleItemProps = {
  item: ScTitleItem
  onPress: () => void
}

export const TitleItem: React.FC<TitleItemProps> = ({ item, onPress }) => {
  if (['8'].includes(item.Cat) || !item.FirstYear || !item.FirstMonth) {
    return null
  }

  return (
    <Button
      className={cn(
        'flex flex-row items-center justify-between gap-0',
        'h-fit p-2',
        'rounded-medium',
        'border-1 border-foreground-100 data-[hover]:border-default-400',
        'bg-content1 text-foreground',
        'whitespace-normal text-start',
        'shadow-small'
      )}
      variant="light"
      fullWidth
      onPress={onPress}
    >
      <TitleItemInner item={item} />

      <div className="shrink-0 px-1 text-foreground-500 dark:text-foreground-600">
        <ChevronRightIcon className="size-4" />
      </div>
    </Button>
  )
}
