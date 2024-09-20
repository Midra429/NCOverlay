import { memo } from 'react'

import { useNcoState } from '@/hooks/useNco'

import { PositionControl } from '@/components/position-control'

import { SlotItems } from './SlotItems'
import { StatusOverlay } from './StatusOverlay'

/**
 * サイド
 */
export const SidePane: React.FC = memo(() => {
  const stateSlotDetails = useNcoState('slotDetails')

  return (
    <div className="flex h-full flex-col">
      <div className="relative size-full overflow-y-auto p-2">
        {stateSlotDetails?.length ? (
          <SlotItems details={stateSlotDetails} />
        ) : (
          <StatusOverlay />
        )}
      </div>

      <PositionControl className="border-t-1 border-foreground-200" compact />
    </div>
  )
})
