import { useNcoState } from '@/hooks/useNco'

import { PositionControl } from '@/components/PositionControl'

import { Header } from './Header'
import { SlotItems } from './SlotItems'
import { StatusOverlay } from './StatusOverlay'

/**
 * サイド
 */
export function SidePane() {
  const stateSlotDetails = useNcoState('slotDetails')

  return (
    <div className="flex h-full flex-col">
      <Header />

      <div className="relative size-full overflow-y-auto p-2">
        {stateSlotDetails?.length ? (
          <SlotItems details={stateSlotDetails} />
        ) : (
          <StatusOverlay />
        )}
      </div>

      <PositionControl className="border-foreground-200 border-t-1" compact />
    </div>
  )
}
