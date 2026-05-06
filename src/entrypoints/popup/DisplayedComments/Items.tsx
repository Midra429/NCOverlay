import { Spinner, cn } from '@heroui/react'

import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/SlotItem'

function StatusOverlay() {
  const stateStatus = useNcoState('status')

  return (
    <div
      className={cn(
        'absolute inset-0 z-20',
        'flex size-full flex-col items-center justify-center gap-3'
      )}
    >
      {stateStatus === 'searching' ? (
        <>
          <Spinner size="lg" color="primary" />

          <p className="text-small">検索中...</p>
        </>
      ) : (
        <span className="text-foreground-500 text-small">
          コメントはありません
        </span>
      )}
    </div>
  )
}

export function Items() {
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
