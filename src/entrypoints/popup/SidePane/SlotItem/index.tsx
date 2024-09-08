import type { StateSlotDetail } from '@/ncoverlay/state'

import { useMemo, useState } from 'react'
import { Skeleton, Link, cn } from '@nextui-org/react'
import {
  CalendarDaysIcon,
  PlayIcon,
  MessageSquareTextIcon,
  ClockIcon,
} from 'lucide-react'

import { formatDate } from '@/utils/format'

import { PanelItem } from '@/components/panel-item'

import { StatusOverlay } from './StatusOverlay'
import { Thumbnail } from './Thumbnail'
import { HideButton } from './HideButton'
import { TranslucentButton } from './TranslucentButton'
import { Config, ConfigButton } from './Config'

export type SlotItemProps = {
  detail: StateSlotDetail
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
            className="line-clamp-3 break-all text-tiny font-bold"
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
      <div className="flex flex-row items-center gap-4">
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
          {ofs.toLocaleString()}
        </span>
      </div>
    )
  }, [detail.offsetMs])

  return element
}

export const SlotItem: React.FC<SlotItemProps> = ({ detail }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  return (
    <PanelItem className={cn(detail.status === 'error' && 'bg-danger/30')}>
      <div className="relative flex h-24 flex-row p-1">
        <div
          className={cn(
            'relative h-full flex-shrink-0',
            detail.hidden && 'opacity-50'
          )}
        >
          {/* サムネイル */}
          <Thumbnail detail={detail} />

          {/* ステータス */}
          <StatusOverlay status={detail.status} />
        </div>

        {/* 情報 (右) */}
        <div
          className={cn(
            'flex size-full flex-col gap-1',
            'mx-2',
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
              'h-4 w-full',
              'text-foreground-500'
            )}
          >
            {/* 再生数・コメント数 */}
            <SlotItemCounter detail={detail} />

            {/* オフセット */}
            <SlotItemOffset detail={detail} />
          </div>
        </div>

        {/* サイドボタン */}
        <div
          className={cn(
            'flex shrink-0 flex-col justify-between gap-1',
            detail.status !== 'ready' && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex shrink-0 flex-col gap-1">
            {/* 非表示 */}
            <HideButton detail={detail} />

            {/* 半透明 */}
            <TranslucentButton detail={detail} />
          </div>

          {/* 設定ボタン */}
          <ConfigButton
            isOpen={isConfigOpen}
            onPress={() => setIsConfigOpen((val) => !val)}
          />
        </div>
      </div>

      {/* 設定 */}
      <Config detail={detail} isOpen={isConfigOpen} />
    </PanelItem>
  )
}
