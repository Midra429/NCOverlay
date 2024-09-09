import type { StateSlotDetail } from '@/ncoverlay/state'

import { cn } from '@nextui-org/react'
import { CalendarDaysIcon } from 'lucide-react'

import { formatDate } from '@/utils/format'

export type DateTimeProps = {
  infoDate: StateSlotDetail['info']['date']
}

export const DateTime: React.FC<DateTimeProps> = ({ infoDate }) => {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 flex-row items-center justify-between',
        'h-4',
        'text-foreground-500'
      )}
    >
      <div className="flex h-full flex-row items-center gap-1">
        <CalendarDaysIcon className="size-3" />
        <span className="text-tiny">
          {typeof infoDate === 'number'
            ? formatDate(infoDate, 'YYYY/MM/DD(d) hh:mm')
            : `${formatDate(infoDate[0], 'YYYY/MM/DD(d) hh:mm:ss')} 〜`}
        </span>
      </div>
    </div>
  )
}
