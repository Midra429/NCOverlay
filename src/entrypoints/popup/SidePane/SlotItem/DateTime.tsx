import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'
import { CalendarDaysIcon } from 'lucide-react'

import { formatDate } from '@/utils/format'

export type DateTimeProps = {
  infoDate: StateSlotDetail['info']['date']
  isSearch?: boolean
}

export const DateTime: React.FC<DateTimeProps> = ({ infoDate, isSearch }) => {
  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between',
        'h-4 flex-shrink-0',
        'text-foreground-500'
      )}
    >
      <div
        className={cn(
          'flex h-full flex-row items-center',
          isSearch ? 'gap-0.5' : 'gap-1'
        )}
      >
        <CalendarDaysIcon className={isSearch ? 'size-mini' : 'size-tiny'} />
        <span className={isSearch ? 'text-mini' : 'text-tiny'}>
          {typeof infoDate === 'number'
            ? formatDate(infoDate, 'YYYY/MM/DD(d) hh:mm')
            : `${formatDate(infoDate[0], 'YYYY/MM/DD(d) hh:mm:ss')} 〜`}
        </span>
      </div>
    </div>
  )
}
