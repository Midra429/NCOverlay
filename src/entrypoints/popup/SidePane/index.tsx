import type { StateSlotDetail } from '@/ncoverlay/state'

import { memo } from 'react'
import { Spinner, cn } from '@nextui-org/react'

import { useNcoState } from '@/hooks/useNco'

import { PositionControl } from '@/components/position-control'

import { SlotItem } from './SlotItem'

const SlotItems: React.FC<{ details: StateSlotDetail[] }> = ({ details }) => {
  return (
    <div className="flex flex-col gap-2">
      {details.map((detail) => (
        <SlotItem key={detail.id} detail={detail} />
      ))}
    </div>
  )
}

const SlotItemsEmpty: React.FC = () => {
  return (
    <div
      className={cn(
        'absolute inset-0 z-20',
        'flex size-full items-center justify-center gap-2'
      )}
    >
      <span className="text-small text-foreground-500">
        コメントはありません
      </span>
    </div>
  )
}

const StatusOverlay: React.FC = () => {
  const stateStatus = useNcoState('status')

  if (stateStatus === 'searching') {
    return (
      <div
        className={cn(
          'absolute inset-0 z-20',
          'flex size-full flex-col items-center justify-center gap-3'
        )}
      >
        <Spinner size="lg" color="primary" />

        <p className="text-small">検索中...</p>
      </div>
    )
  }

  return <SlotItemsEmpty />
}

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

      <div className="border-t-1 border-divider">
        <PositionControl compact />
      </div>
    </div>
  )
})
