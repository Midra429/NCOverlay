import type { StateSlotDetail } from '@/ncoverlay/state'

import { useMemo } from 'react'

import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/slot-item'

export type NiconicoResultsProps = {
  details: StateSlotDetail[]
}

export const NiconicoResults: React.FC<NiconicoResultsProps> = ({
  details,
}) => {
  const stateSlotDetails = useNcoState('slotDetails')

  const ids = useMemo(() => {
    return stateSlotDetails?.map((v) => v.id)
  }, [stateSlotDetails])

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
