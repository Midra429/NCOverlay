import { useEffect, useMemo, useCallback, useState } from 'react'
import { Button, Divider, cn } from '@nextui-org/react'
import { RotateCcwIcon } from 'lucide-react'

import { MARKERS } from '@/constants/markers'

import { ncoState, useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { Tooltip } from '@/components/tooltip'
import { OffsetControl } from '@/components/offset-control'

const MarkerButton: React.FC<{
  markerIdx: number | null
  label: React.ReactNode
  shortLabel: React.ReactNode
  disabled?: boolean
}> = ({ markerIdx, label, shortLabel, disabled }) => {
  const onPress = useCallback(async () => {
    try {
      sendNcoMessage('jumpMarker', markerIdx)
    } catch {}
  }, [markerIdx])

  return (
    <Tooltip content={label}>
      <Button
        className="min-w-0"
        variant="flat"
        fullWidth
        size="sm"
        isDisabled={disabled}
        onPress={onPress}
      >
        {shortLabel}
      </Button>
    </Tooltip>
  )
}

export type PositionControlProps = {
  compact?: boolean
}

export const PositionControl: React.FC<PositionControlProps> = (props) => {
  const stateOffset = useNcoState('offset')
  const stateSlotDetails = useNcoState('slotDetails')

  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  const markerEnableFlags = useMemo(() => {
    const flags: boolean[] = Array(MARKERS.length).fill(false)

    stateSlotDetails?.forEach(({ hidden, markers }) => {
      if (hidden) return

      markers?.forEach((marker, idx) => {
        flags[idx] ||= !!marker
      })
    })

    return flags
  }, [stateSlotDetails])

  useEffect(() => {
    const ofs = stateOffset ?? 0

    setCurrentOffset(ofs)
    setOffset(ofs)
  }, [stateOffset])

  const onApply = useCallback(async () => {
    await ncoState?.set('offset', offset)
  }, [offset])

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-2',
        'bg-content1 text-foreground',
        'overflow-hidden'
      )}
    >
      {stateSlotDetails?.some((v) => !v.hidden && v.markers) && (
        <>
          <div className="flex flex-row gap-2">
            <MarkerButton
              key="reset"
              markerIdx={null}
              label="オフセットをリセット"
              shortLabel={<RotateCcwIcon className="size-3" />}
              disabled={!stateSlotDetails?.some((v) => v.offsetMs)}
            />

            {MARKERS.map(({ label, shortLabel }, idx) => (
              <MarkerButton
                key={idx}
                markerIdx={idx}
                label={label}
                shortLabel={shortLabel}
                disabled={!markerEnableFlags[idx]}
              />
            ))}
          </div>

          <Divider />
        </>
      )}

      <OffsetControl
        compact={props.compact}
        value={offset}
        isValueChanged={offset !== currentOffset}
        onValueChange={(val) => setOffset(val)}
        onApply={onApply}
      />
    </div>
  )
}
