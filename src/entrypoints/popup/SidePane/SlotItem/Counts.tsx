import type { StateSlotDetail } from '@/ncoverlay/state'

import { Skeleton } from '@nextui-org/react'
import { PlayIcon, MessageSquareTextIcon } from 'lucide-react'

export type CountsProps = {
  infoCount: StateSlotDetail['info']['count']
}

export const Counts: React.FC<CountsProps> = ({ infoCount }) => {
  return (
    <div className="flex flex-row items-center gap-4">
      {/* 再生数 */}
      {'view' in infoCount && (
        <div className="flex h-full flex-row items-center gap-1">
          <PlayIcon className="size-3" />
          <span className="text-tiny">
            {infoCount.view.toLocaleString('ja-JP')}
          </span>
        </div>
      )}

      {/* コメント数 */}
      <div className="flex h-full flex-row items-center gap-1">
        <MessageSquareTextIcon className="size-3" />
        <span className="text-tiny">
          {infoCount.comment ? (
            infoCount.comment.toLocaleString('ja-JP')
          ) : (
            <Skeleton className="h-3 w-16" />
          )}
        </span>
      </div>
    </div>
  )
}
