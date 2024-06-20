import { useMemo } from 'react'
import { Button, Tooltip, cn } from '@nextui-org/react'

import { MARKERS } from '@/constants'

import { webext } from '@/utils/webext'

import { useNcoStateJson } from '@/hooks/useNcoState'

import { ncoMessenger } from '@/ncoverlay/messaging'
import { RotateCcwIcon } from 'lucide-react'

const MarkerButton: React.FC<{
  markerIdx: number | null
  label: React.ReactNode
  shortLabel: React.ReactNode
  disabled?: boolean
}> = (props) => {
  return (
    <Tooltip
      classNames={{
        base: 'pointer-events-none max-w-48',
      }}
      size="sm"
      radius="sm"
      color="foreground"
      showArrow
      closeDelay={0}
      content={props.label}
    >
      <Button
        className={cn(
          'min-w-0',
          props.disabled && 'pointer-events-none opacity-50'
        )}
        variant="flat"
        fullWidth
        size="sm"
        disabled={props.disabled}
        onPress={async () => {
          const tab = await webext.getCurrentActiveTab()

          ncoMessenger
            .sendMessage('p-c:jumpMarker', props.markerIdx, tab?.id)
            .catch(() => {})
        }}
      >
        {props.shortLabel}
      </Button>
    </Tooltip>
  )
}

export const MarkerButtons: React.FC = () => {
  const [ncoStateJson] = useNcoStateJson()

  const slotMarkers = useMemo(
    () => ncoStateJson?.slots?.map((v) => v.markers ?? []),
    [ncoStateJson]
  )

  const markerEnableFlags = useMemo(() => {
    const flags: boolean[] = Array(MARKERS.length).fill(false)

    slotMarkers?.forEach((markers) => {
      markers.forEach((marker, idx) => {
        flags[idx] ||= !!marker
      })
    })

    return flags
  }, [slotMarkers])

  return (
    <div className="flex flex-row gap-2 py-1.5">
      <MarkerButton
        key="reset"
        markerIdx={null}
        label="オフセットを0に戻す"
        shortLabel={<RotateCcwIcon className="size-3" />}
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
}
