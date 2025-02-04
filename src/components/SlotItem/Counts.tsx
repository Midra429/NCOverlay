import type { StateSlotDetail } from '@/ncoverlay/state'

import { useMemo } from 'react'
import { cn, Skeleton } from "@heroui/react"
import { PlayIcon, MessageSquareTextIcon, HeartIcon } from 'lucide-react'

import { useSettings } from '@/hooks/useSettings'

export type CountsProps = {
  status: StateSlotDetail['status']
  infoCount: StateSlotDetail['info']['count']
  isSearch?: boolean
}

export const Counts: React.FC<CountsProps> = ({
  status,
  infoCount,
  isSearch,
}) => {
  const [showKawaiiPct] = useSettings('settings:showKawaiiPct')

  const kawaiiPct = useMemo(() => {
    if (!showKawaiiPct || !infoCount.kawaii) return

    return Math.round((infoCount.kawaii / infoCount.comment) * 100 * 10) / 10
  }, [showKawaiiPct, infoCount.comment, infoCount.kawaii])

  return (
    <div
      className={cn(
        'flex flex-row gap-3',
        'shrink-0',
        'text-foreground-500 dark:text-foreground-600'
      )}
    >
      {/* 再生数 */}
      {'view' in infoCount && (
        <div className="flex flex-row items-center gap-1">
          <PlayIcon className={isSearch ? 'size-mini' : 'size-tiny'} />

          <span className={isSearch ? 'text-mini' : 'text-tiny'}>
            {infoCount.view.toLocaleString('ja-JP')}
          </span>
        </div>
      )}

      {/* コメント数 */}
      <div className="flex flex-row items-center gap-1">
        <MessageSquareTextIcon
          className={isSearch ? 'size-mini' : 'size-tiny'}
        />

        <Skeleton
          classNames={{
            base: ['min-w-12 data-[loaded=true]:min-w-0', 'rounded-[4px]'],
            content: 'text-tiny',
          }}
          isLoaded={
            0 < infoCount.comment || status === 'ready' || status === 'error'
          }
        >
          {infoCount.comment.toLocaleString('ja-JP')}
        </Skeleton>
      </div>

      {/* かわいい率 */}
      {!!kawaiiPct && (
        <div className="flex flex-row items-center gap-1">
          <HeartIcon className={isSearch ? 'size-mini' : 'size-tiny'} />

          <span className={isSearch ? 'text-mini' : 'text-tiny'}>
            {kawaiiPct}%
          </span>
        </div>
      )}
    </div>
  )
}
