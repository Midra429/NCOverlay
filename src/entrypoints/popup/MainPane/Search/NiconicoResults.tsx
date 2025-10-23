import type { StateSlotDetail } from '@/ncoverlay/state'

import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/SlotItem'

export interface NiconicoResultsProps {
  details: StateSlotDetail[]
}

export function NiconicoResults({ details }: NiconicoResultsProps) {
  const stateSlotDetails = useNcoState('slotDetails')

  const ids = stateSlotDetails?.map((v) => v.id)

  return (
    <div className="flex flex-col gap-2">
      {details.map((detail) => (
        <SlotItem
          key={detail.id}
          detail={detail}
          isSearch
          isDisabled={ids?.includes(detail.id)}
        />
      ))}
    </div>
  )
}
