import type { Slot } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'
import { Button, Switch, Divider, cn } from '@nextui-org/react'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { ncoMessenger } from '@/ncoverlay/messaging'

import { OffsetControl } from '@/components/offset-control'

const SlotOffsetControl: React.FC<{ slot: Slot }> = ({ slot }) => {
  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const ofs = Math.round((slot.offset ?? 0) / 1000)

    if (ofs !== currentOffset) {
      setCurrentOffset(ofs)
      setOffset(ofs)
    }
  }, [slot])

  return (
    <OffsetControl
      compact
      value={offset}
      isValueChanged={offset !== currentOffset}
      onValueChange={(val) => setOffset(val)}
      onApply={async () => {
        const tab = await webext.getCurrentActiveTab()

        ncoMessenger
          .sendMessage(
            'updateSlot',
            [
              {
                id: slot.id,
                offset: offset * 1000,
              },
            ],
            tab?.id
          )
          .catch(() => {})
      }}
    />
  )
}

const SlotShowToggle: React.FC<{ slot: Slot }> = ({ slot }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(!slot.hidden)
  }, [slot])

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
      onValueChange={async (isSelected) => {
        setShow(isSelected)

        const tab = await webext.getCurrentActiveTab()

        ncoMessenger
          .sendMessage(
            'updateSlot',
            [
              {
                id: slot.id,
                hidden: !isSelected,
              },
            ],
            tab?.id
          )
          .catch(() => {})
      }}
    >
      <span>表示</span>
    </Switch>
  )
}

const SlotTranslucentToggle: React.FC<{ slot: Slot }> = ({ slot }) => {
  const [translucent, setTranslucent] = useState(true)

  useEffect(() => {
    setTranslucent(!!slot.translucent)
  }, [slot])

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
      onValueChange={async (isSelected) => {
        setTranslucent(isSelected)

        const tab = await webext.getCurrentActiveTab()

        ncoMessenger
          .sendMessage(
            'updateSlot',
            [
              {
                id: slot.id,
                translucent: isSelected,
              },
            ],
            tab?.id
          )
          .catch(() => {})
      }}
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

      <Button
        className={cn('absolute bottom-1 right-1', '!size-6 min-h-0 min-w-0')}
        size="sm"
        radius="full"
        variant="flat"
        isIconOnly
        startContent={<XIcon className="size-3.5" />}
        onPress={() => setIsOpen(false)}
      />
    </div>
  ) : (
    <Button
      className={cn('absolute bottom-1 right-1', '!size-6 min-h-0 min-w-0')}
      size="sm"
      radius="full"
      variant="flat"
      isIconOnly
      startContent={<SlidersHorizontalIcon className="size-3.5" />}
      onPress={() => setIsOpen(true)}
    />
  )
}
