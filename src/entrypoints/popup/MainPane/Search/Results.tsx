import type { StateSlotDetail } from '@/ncoverlay/state'

import { useMemo } from 'react'

import { useNcoState } from '@/hooks/useNco'

import { SlotItem } from '@/components/slot-item'

export type ResultsProps = {
  items: StateSlotDetail[]
}

export const Results: React.FC<ResultsProps> = ({ items }) => {
  const stateSlotDetails = useNcoState('slotDetails')

  const ids = useMemo(() => {
    return stateSlotDetails?.map((v) => v.id)
  }, [stateSlotDetails])

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <SlotItem
          key={item.id}
          detail={item}
          isSearch
          isDisabled={ids?.includes(item.id)}
        />
      ))}
    </div>
  )
}
