import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { useMemo } from 'react'
import { Skeleton, Link, Image, cn } from '@nextui-org/react'
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
  detail: StateSlotDetail
}

// サムネイル
const SlotItemThumbnail: React.FC<SlotItemProps> = ({ detail }) => {
  const element = useMemo(() => {
    const formattedDuration = formatDuration(detail.info.duration)

    if (detail.type === 'jikkyo') {
      const jkChId = detail.id.split(':')[0] as JikkyoChannelId

      return (
        // 実況のチャンネル情報
        <div className="h-full rounded-lg bg-content3 p-[1px]">
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-0.5',
              'aspect-video h-full overflow-hidden rounded-lg',
              'px-1',
              'bg-jikkyo dark:bg-jikkyo-700',
              'select-none'
            )}
          >
            <span className="text-tiny text-white/80 drop-shadow-sm">
              {jkChId}
            </span>
            <span className="line-clamp-1 text-small font-bold text-white drop-shadow-md">
              {JIKKYO_CHANNELS[jkChId!]}
            </span>
            <span className="text-tiny text-white/80 drop-shadow-sm">
              ({formattedDuration})
            </span>
          </div>
        </div>
      )
    }

    return (
      <>
        <Image
          classNames={{
            wrapper: 'h-full rounded-lg bg-foreground-300 p-[1px]',
            img: 'aspect-video h-full rounded-lg object-cover',
          }}
          src={detail.info.thumbnail}
          draggable={false}
        />

        <div
          className={cn(
            'absolute bottom-1 right-1 z-10',
            'flex items-center',
            'px-1 py-[1px]',
            'bg-black/40 backdrop-blur-md',
            'border-1 border-white/25',
            'shadow-small',
            'rounded-md'
          )}
        >
          <span className="text-tiny text-white">{formattedDuration}</span>
        </div>
      </>
    )
  }, [detail.id, detail.type, detail.info])

  return element
}

// 日付
const SlotItemDate: React.FC<SlotItemProps> = ({ detail }) => {
  const element = useMemo(() => {
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
            {detail.type !== 'jikkyo'
              ? formatDate(detail.info.date, 'YYYY/MM/DD(d) hh:mm')
              : `${formatDate(detail.info.date[0], 'YYYY/MM/DD(d) hh:mm:ss')} 〜`}
          </span>
        </div>
      </div>
    )
  }, [detail.type, detail.info.date])

  return element
}

// タイトル
const SlotItemTitle: React.FC<SlotItemProps> = ({ detail }) => {
  const element = useMemo(() => {
    const { href } = new URL(
      detail.info.id,
      detail.type === 'jikkyo'
        ? `https://cal.syoboi.jp/tid/`
        : 'https://www.nicovideo.jp/watch/'
    )

    return (
      <div className="flex h-full flex-col justify-start">
        <Link
          className="underline-offset-2"
          color="foreground"
          href={href}
          isExternal
        >
          <span
            className="line-clamp-3 text-tiny font-bold"
            title={
              190 < new Blob([detail.info.title]).size
                ? detail.info.title
                : undefined
            }
          >
            {detail.info.title}
          </span>
        </Link>
      </div>
    )
  }, [detail.info.id, detail.info.title])

  return element
}

// カウンター
const SlotItemCounter: React.FC<SlotItemProps> = ({ detail }) => {
  const element = useMemo(() => {
    return (
      <div className="flex flex-row items-center gap-5">
        {/* 再生数 */}
        {detail.type !== 'jikkyo' && (
          <div className="flex h-full flex-row items-center gap-1">
            <PlayIcon className="size-3" />
            <span className="text-tiny">
              {detail.info.count.view.toLocaleString('ja-JP')}
            </span>
          </div>
        )}

        {/* コメント数 */}
        <div className="flex h-full flex-row items-center gap-1">
          <MessageSquareTextIcon className="size-3" />
          <span className="text-tiny">
            {detail.info.count.comment ? (
              detail.info.count.comment.toLocaleString('ja-JP')
            ) : (
              <Skeleton className="h-3 w-16" />
            )}
          </span>
        </div>
      </div>
    )
  }, [detail.type, detail.info.count])

  return element
}

// オフセット
const SlotItemOffset: React.FC<SlotItemProps> = ({ detail }) => {
  const element = useMemo(() => {
    const ofs = Math.round((detail.offsetMs ?? 0) / 1000)

    if (ofs === 0) return

    return (
      <div className="flex h-full flex-row items-center gap-1">
        <ClockIcon className="size-3" />
        <span className="text-tiny">
          {0 < ofs && '+'}
          {ofs.toString()}
        </span>
      </div>
    )
  }, [detail.offsetMs])

  return element
}

export const SlotItem: React.FC<SlotItemProps> = ({ detail }) => {
  return (
    <PanelItem
      key="1"
      className={cn(
        'relative flex h-24 flex-row gap-2 p-1',
        detail.status === 'error' && 'bg-danger/30'
      )}
    >
      <div
        className={cn(
          'relative h-full flex-shrink-0',
          detail.hidden && 'opacity-50'
        )}
      >
        {/* サムネイル */}
        <SlotItemThumbnail detail={detail} />

        {/* ステータス */}
        <StatusOverlay status={detail.status} />
      </div>

      {/* 情報 (右) */}
      <div
        className={cn(
          'flex h-full w-full flex-col gap-1',
          detail.hidden && 'opacity-50'
        )}
      >
        {/* 日付 */}
        <SlotItemDate detail={detail} />

        {/* タイトル */}
        <SlotItemTitle detail={detail} />

        <div
          className={cn(
            'flex flex-shrink-0 flex-row items-center justify-between',
            'mr-8 h-4',
            'text-foreground-500'
          )}
        >
          {/* 再生数・コメント数 */}
          <SlotItemCounter detail={detail} />

          {/* オフセット */}
          <SlotItemOffset detail={detail} />
        </div>
      </div>

      {/* タグとか */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          detail.hidden && 'opacity-50'
        )}
      >
        <SourceTag source={detail.type} />
      </div>

      {/* 設定 */}
      {detail.status === 'ready' && <Config detail={detail} />}
    </PanelItem>
  )
}
