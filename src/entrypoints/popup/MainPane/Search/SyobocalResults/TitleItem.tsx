import type {
  SyoboCalTitleMedium,
  SyoboCalTitleSearch,
} from '@midra/nco-utils/types/api/syobocal/json'

import { cn } from '@heroui/react'
import { CalendarDaysIcon, ChevronRightIcon, ShapesIcon } from 'lucide-react'
import { useOverflowDetector } from 'react-detectable-overflow'
import { SYOBOCAL_CATEGORIES } from '@midra/nco-utils/api/constants'

export type ScTitleItem = SyoboCalTitleMedium | SyoboCalTitleSearch

export interface TitleItemInnerProps {
  item: ScTitleItem
  isHeader?: boolean
}

export function TitleItemInner({ item, isHeader }: TitleItemInnerProps) {
  const { ref, overflow } = useOverflowDetector()

  const period = [
    `${item.FirstYear}年${item.FirstMonth}月`,
    [
      item.FirstEndYear &&
        item.FirstEndYear !== item.FirstYear &&
        `${item.FirstEndYear}年`,
      item.FirstEndMonth && `${item.FirstEndMonth}月`,
    ]
      .filter(Boolean)
      .join(''),
  ]
    .filter(Boolean)
    .join('〜')

  const category = SYOBOCAL_CATEGORIES[item.Cat]?.replace('/再放送', '')

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={cn(
          'font-semibold',
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

export interface TitleItemProps {
  item: ScTitleItem
  onClick: () => void
}

export function TitleItem({ item, onClick }: TitleItemProps) {
  if (!item.FirstYear || !item.FirstMonth) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between',
        'p-2',
        'rounded-medium',
        'border-1 border-foreground-200 hover:border-default-400',
        'bg-content1 hover:bg-content2/90',
        'text-foreground',
        'cursor-pointer',
        'transition-colors'
      )}
      onClick={onClick}
    >
      <TitleItemInner item={item} />

      <div className="shrink-0 px-1 text-foreground-500 dark:text-foreground-600">
        <ChevronRightIcon className="size-4" />
      </div>
    </div>
  )
}
