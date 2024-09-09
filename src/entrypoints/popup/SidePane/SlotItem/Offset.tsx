import type { StateSlotDetail } from '@/ncoverlay/state'

import { ClockIcon } from 'lucide-react'

export type OffsetProps = {
  offsetMs: StateSlotDetail['offsetMs']
}

export const Offset: React.FC<OffsetProps> = ({ offsetMs }) => {
  const ofs = Math.round((offsetMs ?? 0) / 1000)

  return (
    ofs !== 0 && (
      <div className="flex h-full flex-row items-center gap-1">
        <ClockIcon className="size-3" />
        <span className="text-tiny">
          {0 < ofs && '+'}
          {ofs.toLocaleString()}
        </span>
      </div>
    )
  )
}
