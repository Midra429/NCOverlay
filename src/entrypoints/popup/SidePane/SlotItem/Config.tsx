import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState, useCallback } from 'react'
import { Button, Switch, Divider, cn } from '@nextui-org/react'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

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

const SlotOffsetControl: React.FC<{ detail: StateSlotDetail }> = ({
  detail,
}) => {
  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const ofs = Math.round((detail.offsetMs ?? 0) / 1000)

    if (ofs !== currentOffset) {
      setCurrentOffset(ofs)
      setOffset(ofs)
    }
  }, [detail.offsetMs])

  const onApply = useCallback(async () => {
    await ncoState?.update('slotDetails', ['id'], {
      id: detail.id,
      offsetMs: offset * 1000,
    })
  }, [detail.id, offset])

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

const SlotShowToggle: React.FC<{ detail: StateSlotDetail }> = ({ detail }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(!detail.hidden)
  }, [detail.hidden])

  const onValueChange = useCallback(
    async (isSelected: boolean) => {
      setShow(isSelected)

      await ncoState?.update('slotDetails', ['id'], {
        id: detail.id,
        hidden: !isSelected,
      })
    },
    [detail.id]
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

const SlotTranslucentToggle: React.FC<{ detail: StateSlotDetail }> = ({
  detail,
}) => {
  const [translucent, setTranslucent] = useState(true)

  useEffect(() => {
    setTranslucent(!!detail.translucent)
  }, [detail.translucent])

  const onValueChange = useCallback(
    async (isSelected: boolean) => {
      setTranslucent(isSelected)

      await ncoState?.update('slotDetails', ['id'], {
        id: detail.id,
        translucent: isSelected,
      })
    },
    [detail.id]
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
      isDisabled={detail.hidden}
      onValueChange={onValueChange}
    >
      <span>半透明</span>
    </Switch>
  )
}

export type ConfigProps = {
  detail: StateSlotDetail
}

export const Config: React.FC<ConfigProps> = ({ detail }) => {
  const [isOpen, setIsOpen] = useState(false)

  return isOpen ? (
    <div
      className={cn(
        'absolute inset-0 z-10',
        'flex flex-col justify-between gap-2',
        'bg-content1 p-2'
      )}
    >
      <SlotOffsetControl detail={detail} />

      <Divider />

      <div className="flex flex-row gap-3">
        <SlotShowToggle detail={detail} />

        <Divider orientation="vertical" />

        <SlotTranslucentToggle detail={detail} />
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
