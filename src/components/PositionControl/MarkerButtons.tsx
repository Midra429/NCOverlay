import type { MarkerKey } from '@/constants/markers'

import { Button, cn } from '@heroui/react'
import { RotateCcwIcon } from 'lucide-react'

import { MARKERS } from '@/constants/markers'
import { useNcoState } from '@/hooks/useNco'
import { useSettings } from '@/hooks/useSettings'
import { sendMessageToContent } from '@/messaging/to-content'

import { Tooltip } from '@/components/Tooltip'

export interface MarkerButtonProps {
  markerKey: MarkerKey | null
  label: React.ReactNode
  shortLabel: React.ReactNode
  disabled?: boolean
}

export function MarkerButton({
  markerKey,
  label,
  shortLabel,
  disabled,
}: MarkerButtonProps) {
  function onPress() {
    sendMessageToContent('jumpMarker', markerKey)
  }

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

export function MarkerButtons() {
  const stateSlotDetails = useNcoState('slotDetails')
  const [adjustJikkyoOffset] = useSettings(
    'settings:comment:adjustJikkyoOffset'
  )

  const markerEnableFlags = Array(MARKERS.length)
    .fill(false)
    .map((_, idx) => {
      return stateSlotDetails?.some((detail) => {
        return (
          !detail.hidden &&
          !detail.skip &&
          detail.type === 'jikkyo' &&
          (!adjustJikkyoOffset || !detail.chapters.length) &&
          detail.markers[idx] !== null
        )
      })
    })
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
          markerKey={null}
          label="オフセットをリセット"
          shortLabel={<RotateCcwIcon className="size-4" />}
          disabled={resetButtonDisabled}
        />

        {MARKERS.map(({ key, label, shortLabel }, idx) => (
          <MarkerButton
            key={key}
            markerKey={key}
            label={label}
            shortLabel={shortLabel}
            disabled={!markerEnableFlags[idx]}
          />
        ))}
      </div>
    )
  )
}
