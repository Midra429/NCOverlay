import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/SlotItem'

import { StatusOverlay } from './StatusOverlay'

/**
 * サイド
 */
export function Comments() {
  const stateSlotDetails = useNcoState('slotDetails')

  return (
    <div className="relative size-full overflow-y-auto p-2">
      {stateSlotDetails?.length ? (
        <div className="flex flex-col gap-2">
          {stateSlotDetails.map((detail) => (
            <SlotItem key={detail.id} detail={detail} />
          ))}
        </div>
      ) : (
        <StatusOverlay />
      )}
    </div>
  )
}
