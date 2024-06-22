import { useEffect, useMemo, useState } from 'react'
import { Button, Divider, Tooltip } from '@nextui-org/react'
import { RotateCcwIcon } from 'lucide-react'

import { MARKERS } from '@/constants'

import { webext } from '@/utils/webext'
import { useNcoStateJson } from '@/hooks/useNcoState'
import { ncoMessenger } from '@/ncoverlay/messaging'

import { OffsetControl } from '@/components/offset-control'

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
        className="min-w-0"
        variant="flat"
        fullWidth
        size="sm"
        isDisabled={props.disabled}
        onPress={async () => {
          const tab = await webext.getCurrentActiveTab()

          ncoMessenger
            .sendMessage('p-c:jumpMarker', [props.markerIdx], tab?.id)
            .catch(() => {})
        }}
      >
        {props.shortLabel}
      </Button>
    </Tooltip>
  )
}

export const PositionControl: React.FC = () => {
  const ncoStateJson = useNcoStateJson()

  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)
  const [slotMarkers, setSlotMarkers] = useState<(number | null)[][]>()

  useEffect(() => {
    const ofs = Math.round((ncoStateJson?.offset ?? 0) / 1000)

    setCurrentOffset(ofs)
    setOffset(ofs)
    setSlotMarkers(ncoStateJson?.slots?.map((v) => v.markers ?? []))
  }, [ncoStateJson])

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
    <div className="flex flex-col gap-2 py-1.5">
      <div className="flex flex-row gap-2">
        <MarkerButton
          key="reset"
          markerIdx={null}
          label="オフセットをリセット"
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

      <Divider />

      <OffsetControl
        value={offset}
        isValueChanged={offset !== currentOffset}
        onValueChange={(val) => setOffset(val)}
        onApply={async () => {
          const tab = await webext.getCurrentActiveTab()

          ncoMessenger
            .sendMessage('p-c:setGlobalOffset', [offset * 1000], tab?.id)
            .catch(() => {})
        }}
      />
    </div>
  )
}
