import { useMemo, useCallback } from 'react'
import { Button, cn } from '@heroui/react'
import { RotateCcwIcon } from 'lucide-react'

import { MARKERS } from '@/constants/markers'

import { useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { Tooltip } from '@/components/Tooltip'

export type MarkerButtonProps = {
  markerIdx: number | null
  label: React.ReactNode
  shortLabel: React.ReactNode
  disabled?: boolean
}

export const MarkerButton: React.FC<MarkerButtonProps> = ({
  markerIdx,
  label,
  shortLabel,
  disabled,
}) => {
  const onPress = useCallback(() => {
    sendNcoMessage('jumpMarker', markerIdx)
  }, [markerIdx])

  return (
    <Tooltip content={label}>
      <Button
        className="min-w-0 text-small"
        variant="flat"
        size="sm"
        fullWidth
        isDisabled={disabled}
        onPress={onPress}
      >
        {shortLabel}
      </Button>
    </Tooltip>
  )
}

export const MarkerButtons: React.FC = () => {
  const stateSlotDetails = useNcoState('slotDetails')

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

  const hasMarker = useMemo(() => {
    return !!stateSlotDetails?.some((v) => !v.hidden && v.markers)
  }, [stateSlotDetails])

  const resetButtonDisabled = useMemo(() => {
    return !stateSlotDetails?.some((v) => v.offsetMs)
  }, [stateSlotDetails])

  return (
    hasMarker && (
      <div
        className={cn(
          'flex flex-row gap-2',
          'p-2',
          'border-b-1 border-foreground-200'
        )}
      >
        <MarkerButton
          markerIdx={null}
          label="オフセットをリセット"
          shortLabel={<RotateCcwIcon className="size-4" />}
          disabled={resetButtonDisabled}
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
    )
  )
}
