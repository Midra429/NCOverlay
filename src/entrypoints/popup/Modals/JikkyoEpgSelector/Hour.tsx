import { cn } from '@heroui/react'

import { ROW_HEIGHT } from './TverEpg'

export interface HourCellProps {
  hour: number
}

export function HourCell({ hour }: HourCellProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        'shrink-0',
        'border-divider border-b-1',
        'bg-content2 text-content2-foreground',
        'font-semibold text-mini'
      )}
      style={{
        height: ROW_HEIGHT,
      }}
    >
      <span className={cn('sticky top-5.25', 'py-1')}>{hour}</span>
    </div>
  )
}

export function Hours() {
  return (
    <div
      className={cn(
        'sticky left-0 z-20',
        'flex flex-col',
        'shrink-0',
        'border-divider border-r-1'
      )}
      style={{
        width: 20,
      }}
    >
      {Array(24)
        .fill(0)
        .map((_, i) => (i + 5) % 24)
        .map((hour) => (
          <HourCell key={hour} hour={hour} />
        ))}
    </div>
  )
}
