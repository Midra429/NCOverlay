import type { StateSlotDetail } from '@/ncoverlay/state'

import { Skeleton } from '@nextui-org/react'
import { PlayIcon, MessageSquareTextIcon } from 'lucide-react'

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
  return (
    <div className="flex flex-row gap-4">
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
          isLoaded={0 < infoCount.comment || status === 'ready'}
        >
          {infoCount.comment.toLocaleString('ja-JP')}
        </Skeleton>
      </div>
    </div>
  )
}
