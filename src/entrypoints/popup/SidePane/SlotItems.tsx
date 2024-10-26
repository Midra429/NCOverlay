import type { StateSlotDetail } from '@/ncoverlay/state'

import { SlotItem } from '@/components/SlotItem'

export type SlotItemsProps = {
  details: StateSlotDetail[]
}

export const SlotItems: React.FC<SlotItemsProps> = ({ details }) => {
  return (
    <div className="flex flex-col gap-2">
      {details.map((detail) => (
        <SlotItem key={detail.id} detail={detail} />
      ))}
    </div>
  )
}
