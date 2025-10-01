import type { StateSlotDetail } from '@/ncoverlay/state'

import { SlotItem } from '@/components/SlotItem'

export type SlotItemsProps = {
  details: StateSlotDetail[]
}

export function SlotItems({ details }: SlotItemsProps) {
  return (
    <div className="flex flex-col gap-2">
      {details.map((detail) => (
        <SlotItem key={detail.id} detail={detail} />
      ))}
    </div>
  )
}
