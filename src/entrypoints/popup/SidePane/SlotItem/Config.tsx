import type { Slot } from '@/ncoverlay/state'

import { useEffect, useState, useCallback } from 'react'
import { Button, Switch, Divider, cn } from '@nextui-org/react'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'

import { sendNcoMessage } from '@/ncoverlay/messaging'

import { OffsetControl } from '@/components/offset-control'

const ConfigButton: React.FC<{
  icon: React.FC<React.ComponentProps<'svg'>>
  onPress: () => void
}> = ({ icon: Icon, onPress }) => {
  return (
    <Button
      className={cn('absolute bottom-1 right-1', '!size-6 min-h-0 min-w-0')}
      size="sm"
      radius="full"
      variant="flat"
      isIconOnly
      startContent={<Icon className="size-3.5" />}
      onPress={onPress}
    />
  )
}

const SlotOffsetControl: React.FC<{ slot: Slot }> = ({ slot }) => {
  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const ofs = Math.round((slot.offsetMs ?? 0) / 1000)

    if (ofs !== currentOffset) {
      setCurrentOffset(ofs)
      setOffset(ofs)
    }
  }, [slot.offsetMs])

  const onApply = useCallback(async () => {
    try {
      sendNcoMessage('updateSlot', {
        id: slot.id,
        offsetMs: offset * 1000,
      })
    } catch {}
  }, [slot.id, offset])

  return (
    <OffsetControl
      compact
      value={offset}
      isValueChanged={offset !== currentOffset}
      onValueChange={(val) => setOffset(val)}
      onApply={onApply}
    />
  )
}

const SlotShowToggle: React.FC<{ slot: Slot }> = ({ slot }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(!slot.hidden)
  }, [slot.hidden])

  const onValueChange = useCallback(
    async (isSelected: boolean) => {
      setShow(isSelected)

      try {
        sendNcoMessage('updateSlot', {
          id: slot.id,
          hidden: !isSelected,
        })
      } catch {}
    },
    [slot.id]
  )

  return (
    <Switch
      classNames={{
        base: cn(
          'flex flex-row-reverse justify-between gap-2',
          'w-fit py-0.5',
          'overflow-hidden'
        ),
        wrapper: 'm-0',
      }}
      size="sm"
      isSelected={show}
      onValueChange={onValueChange}
    >
      <span>表示</span>
    </Switch>
  )
}

const SlotTranslucentToggle: React.FC<{ slot: Slot }> = ({ slot }) => {
  const [translucent, setTranslucent] = useState(true)

  useEffect(() => {
    setTranslucent(!!slot.translucent)
  }, [slot.translucent])

  const onValueChange = useCallback(
    async (isSelected: boolean) => {
      setTranslucent(isSelected)

      try {
        sendNcoMessage('updateSlot', {
          id: slot.id,
          translucent: isSelected,
        })
      } catch {}
    },
    [slot.id]
  )

  return (
    <Switch
      classNames={{
        base: cn(
          'flex flex-row-reverse justify-between gap-2',
          'w-fit py-0.5',
          'overflow-hidden'
        ),
        wrapper: 'm-0',
      }}
      size="sm"
      isSelected={translucent}
      isDisabled={slot.hidden}
      onValueChange={onValueChange}
    >
      <span>半透明</span>
    </Switch>
  )
}

export type ConfigProps = {
  slot: Slot
}

export const Config: React.FC<ConfigProps> = ({ slot }) => {
  const [isOpen, setIsOpen] = useState(false)

  return isOpen ? (
    <div
      className={cn(
        'absolute inset-0 z-10',
        'flex flex-col justify-between gap-2',
        'bg-content1 p-2'
      )}
    >
      <SlotOffsetControl slot={slot} />

      <Divider />

      <div className="flex flex-row gap-3">
        <SlotShowToggle slot={slot} />

        <Divider orientation="vertical" />

        <SlotTranslucentToggle slot={slot} />
      </div>

      <ConfigButton icon={XIcon} onPress={() => setIsOpen(false)} />
    </div>
  ) : (
    <ConfigButton
      icon={SlidersHorizontalIcon}
      onPress={() => setIsOpen(true)}
    />
  )
}
