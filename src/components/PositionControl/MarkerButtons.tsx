import { Button, cn } from '@heroui/react'
import { RotateCcwIcon } from 'lucide-react'

import { MARKERS } from '@/constants/markers'

import { useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { Tooltip } from '@/components/Tooltip'

export interface MarkerButtonProps {
  markerIdx: number | null
  label: React.ReactNode
  shortLabel: React.ReactNode
  disabled?: boolean
}

export function MarkerButton({
  markerIdx,
  label,
  shortLabel,
  disabled,
}: MarkerButtonProps) {
  function onPress() {
    sendNcoMessage('jumpMarker', markerIdx)
  }

  return (
    <Tooltip content={label}>
      <Button
        className="text-small min-w-0"
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

export function MarkerButtons() {
  const stateSlotDetails = useNcoState('slotDetails')

  const markerEnableFlags = Array(MARKERS.length)
    .fill(false)
    .map((_, i) => !!stateSlotDetails?.some((v) => !v.hidden && v.markers?.[i]))
  const hasMarker = markerEnableFlags.some((v) => v)
  const resetButtonDisabled = !stateSlotDetails?.some((v) => v.offsetMs)

  return (
    hasMarker && (
      <div
        className={cn(
          'flex flex-row gap-2',
          'p-2',
          'border-foreground-200 border-b-1'
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
