import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { Slot } from '@/ncoverlay/state'

import { Skeleton, Image, cn } from '@nextui-org/react'
import {
  CalendarDaysIcon,
  PlayIcon,
  MessageSquareTextIcon,
  ClockIcon,
} from 'lucide-react'

import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { formatDate, formatDuration } from '@/utils/format'

import { PanelItem } from '@/components/panel-item'

import { StatusOverlay } from './StatusOverlay'
import { SourceTag } from './SourceTag'
import { Config } from './Config'

export type SlotItemProps = {
  slot: Slot
}

export const SlotItem: React.FC<SlotItemProps> = ({ slot }) => {
  const ofs = Math.round((slot.offset ?? 0) / 1000)
  const jkChId =
    slot.type === 'jikkyo' ? (slot.id.split(':')[0] as JikkyoChannelId) : null

  return (
    <PanelItem
      key="1"
      className={cn(
        'relative flex h-24 flex-row gap-2 p-1',
        slot.status === 'error' && 'bg-danger/30'
      )}
    >
      {/* サムネイル (左) */}
      <div
        className={cn(
          'relative h-full flex-shrink-0',
          slot.hidden && 'opacity-50'
        )}
      >
        {slot.type !== 'jikkyo' ? (
          // サムネイル画像
          <Image
            classNames={{
              wrapper: 'h-full bg-foreground-300 p-[1px]',
              img: 'aspect-video h-full object-contain',
            }}
            radius="lg"
            src={slot.info.thumbnail}
          />
        ) : (
          // 実況のチャンネル情報
          <div className="h-full rounded-lg bg-content3 p-[1px]">
            <div
              className={cn(
                'flex flex-col items-center justify-center gap-0.5',
                'aspect-video h-full overflow-hidden rounded-lg',
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

        {/* ステータス */}
        <StatusOverlay status={slot.status} />
      </div>

      {/* 情報 (右) */}
      <div
        className={cn(
          'flex h-full w-full flex-col gap-1',
          slot.hidden && 'opacity-50'
        )}
      >
        {/* 日付 */}
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

        {/* タイトル */}
        <div className="h-full">
          <span
            className="line-clamp-3 text-tiny font-bold"
            title={
              190 < new Blob([slot.info.title]).size
                ? slot.info.title
                : undefined
            }
          >
            {slot.info.title}
          </span>
        </div>

        <div
          className={cn(
            'flex flex-shrink-0 flex-row items-center justify-between',
            'mr-8 h-4',
            'text-foreground-500'
          )}
        >
          <div className="flex flex-row items-center gap-5">
            {/* 再生数 */}
            {slot.type !== 'jikkyo' && (
              <div className="flex h-full flex-row items-center gap-1">
                <PlayIcon className="size-3" />
                <span className="text-tiny">
                  {slot.info.count.view.toLocaleString('ja-JP')}
                </span>
              </div>
            )}

            {/* コメント数 */}
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

          {/* オフセット */}
          {ofs !== 0 && (
            <div className="flex h-full flex-row items-center gap-1">
              <ClockIcon className="size-3" />
              <span className="text-tiny">
                {0 < ofs && '+'}
                {ofs.toString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* タグとか */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          slot.hidden && 'opacity-50'
        )}
      >
        <SourceTag source={slot.type} />
      </div>

      {/* 設定 */}
      {slot.status === 'ready' && <Config slot={slot} />}
    </PanelItem>
  )
}
