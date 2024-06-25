import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { Slot } from '@/ncoverlay/state'

import { Skeleton, Image, cn } from '@nextui-org/react'
import { CalendarDaysIcon, PlayIcon, MessageSquareTextIcon } from 'lucide-react'

import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { formatDate, formatDuration } from '@/utils/format'

import { PanelItem } from '@/components/panel-item'

import { SourceTag } from './SourceTag'
import { StatusOverlay } from './StatusOverlay'
import { Config } from './Config'

export type SlotItemProps = {
  slot: Slot
}

export const SlotItem: React.FC<SlotItemProps> = ({ slot }) => {
  const jkChId =
    slot.type === 'jikkyo' ? (slot.id.split(':')[0] as JikkyoChannelId) : null

  return (
    <PanelItem
      key="1"
      className={cn(
        'relative flex h-24 flex-row gap-2.5 p-1.5',
        slot.status === 'error' && 'bg-danger/30'
      )}
    >
      <div
        className={cn(
          'relative h-full flex-shrink-0',
          slot.hidden && 'opacity-50'
        )}
      >
        {slot.type !== 'jikkyo' ? (
          <Image
            classNames={{
              wrapper: 'h-full bg-foreground-300 p-[1px]',
              img: 'aspect-video h-full object-contain',
            }}
            radius="md"
            src={slot.info.thumbnail}
          />
        ) : (
          <div className="h-full rounded-md bg-content3 p-[1px]">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-0.5',
                'aspect-video h-full overflow-hidden rounded-md',
                'px-1',
                'bg-jikkyo dark:bg-jikkyo-700'
              )}
            >
              <span className="text-tiny text-white/80 drop-shadow-sm">
                {jkChId}
              </span>
              <span className="line-clamp-1 text-small font-bold text-white drop-shadow-md">
                {JIKKYO_CHANNELS[jkChId!]}
              </span>
              <span className="text-tiny text-white/80 drop-shadow-sm">
                ({formatDuration(slot.info.duration)})
              </span>
            </div>
          </div>
        )}

        <StatusOverlay status={slot.status} />
      </div>

      <div
        className={cn(
          'flex h-full flex-col gap-1',
          slot.hidden && 'opacity-50'
        )}
      >
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
              {slot.type !== 'jikkyo'
                ? formatDate(slot.info.date, 'YYYY/MM/DD(d) hh:mm')
                : `${formatDate(slot.info.date[0], 'YYYY/MM/DD(d) hh:mm:ss')} 〜`}
            </span>
          </div>
        </div>

        <div className="h-full">
          <span className="line-clamp-2 text-small font-bold">
            {slot.info.title}
          </span>
        </div>

        <div
          className={cn(
            'flex flex-shrink-0 flex-row items-center gap-5',
            'h-4',
            'text-foreground-500'
          )}
        >
          {slot.type !== 'jikkyo' && (
            <div className="flex h-full flex-row items-center gap-1">
              <PlayIcon className="size-3" />
              <span className="text-tiny">
                {slot.info.count.view.toLocaleString('ja-JP')}
              </span>
            </div>
          )}

          <div className="flex h-full flex-row items-center gap-1">
            <MessageSquareTextIcon className="size-3" />
            <span className="text-tiny">
              {slot.info.count.comment ? (
                slot.info.count.comment.toLocaleString('ja-JP')
              ) : (
                <Skeleton className="h-3 w-16" />
              )}
            </span>
          </div>
        </div>
      </div>

      <div className={cn(slot.hidden && 'opacity-50')}>
        <SourceTag source={slot.type} />
      </div>

      {slot.status === 'ready' && <Config slot={slot} />}
    </PanelItem>
  )
}
