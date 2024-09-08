import type { TooltipPlacement } from '@nextui-org/react'

import { useEffect, useMemo, useCallback, useState } from 'react'
import { Button, Divider, Tooltip } from '@nextui-org/react'
import { RotateCcwIcon } from 'lucide-react'

import { MARKERS } from '@/constants/markers'

import { ncoState, useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { PanelItem } from '@/components/panel-item'
import { OffsetControl } from '@/components/offset-control'

const MarkerButton: React.FC<{
  markerIdx: number | null
  placement?: TooltipPlacement
  label: React.ReactNode
  shortLabel: React.ReactNode
  disabled?: boolean
}> = ({ markerIdx, placement, label, shortLabel, disabled }) => {
  const onPress = useCallback(async () => {
    try {
      sendNcoMessage('jumpMarker', markerIdx)
    } catch {}
  }, [markerIdx])

  return (
    <Tooltip
      classNames={{
        base: 'pointer-events-none max-w-48',
      }}
      placement={placement}
      size="sm"
      radius="sm"
      color="foreground"
      showArrow
      closeDelay={0}
      content={label}
    >
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

export const PositionControl: React.FC = () => {
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
    <PanelItem className="flex flex-col gap-2 px-2.5 py-2">
      {stateSlotDetails?.some((v) => !v.hidden && v.markers) && (
        <>
          <div className="flex flex-row gap-2">
            <MarkerButton
              key="reset"
              markerIdx={null}
              placement="top-start"
              label="オフセットをリセット"
              shortLabel={<RotateCcwIcon className="size-3" />}
            />

            {MARKERS.map(({ label, shortLabel }, idx, ary) => (
              <MarkerButton
                key={idx}
                markerIdx={idx}
                placement={idx === ary.length - 1 ? 'top-end' : undefined}
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
        value={offset}
        isValueChanged={offset !== currentOffset}
        onValueChange={(val) => setOffset(val)}
        onApply={onApply}
      />
    </PanelItem>
  )
}
