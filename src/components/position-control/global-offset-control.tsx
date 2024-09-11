import { useEffect, useState, useCallback } from 'react'

import { ncoState, useNcoState } from '@/hooks/useNco'

import { OffsetControl } from '@/components/offset-control'

export type GlobalOffsetControlProps = {
  compact?: boolean
}

export const GlobalOffsetControl: React.FC<GlobalOffsetControlProps> = ({
  compact,
}) => {
  const stateOffset = useNcoState('offset')

  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const ofs = stateOffset ?? 0

    setCurrentOffset(ofs)
    setOffset(ofs)
  }, [stateOffset])

  const onApply = useCallback(() => {
    ncoState?.set('offset', offset)
  }, [offset])

  return (
    <div className="p-2">
      <OffsetControl
        compact={compact}
        value={offset}
        isValueChanged={offset !== currentOffset}
        onValueChange={setOffset}
        onApply={onApply}
      />
    </div>
  )
}
