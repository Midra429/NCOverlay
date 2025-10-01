import type { Variants } from 'framer-motion'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { TRANSITION_VARIANTS } from '@heroui/framer-utils'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useWillChange,
  m,
} from 'framer-motion'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

import { OffsetControl } from '@/components/OffsetControl'

const transitionVariants: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: 'hidden' },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: 'unset' },
}

export type OptionsButtonProps = {
  isOpen: boolean
  onPress: () => void
}

export function OptionsButton({ isOpen, onPress }: OptionsButtonProps) {
  return (
    <Button
      className="!size-6 min-h-0 min-w-0"
      size="sm"
      radius="full"
      variant="flat"
      isIconOnly
      onPress={onPress}
    >
      {isOpen ? (
        <XIcon className="size-3.5" />
      ) : (
        <SlidersHorizontalIcon className="size-3.5" />
      )}
    </Button>
  )
}

type SlotOffsetControlProps = {
  id: StateSlotDetail['id']
  offsetMs: StateSlotDetail['offsetMs']
}

function SlotOffsetControl({ id, offsetMs }: SlotOffsetControlProps) {
  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const ofs = Math.round((offsetMs ?? 0) / 1000)

    if (ofs !== currentOffset) {
      setCurrentOffset(ofs)
      setOffset(ofs)
    }
  }, [offsetMs])

  async function onApply() {
    await ncoState?.update('slotDetails', ['id'], {
      id,
      offsetMs: offset * 1000,
    })
  }

  return (
    <OffsetControl
      compact
      value={offset}
      isValueChanged={offset !== currentOffset}
      onValueChange={setOffset}
      onApply={onApply}
    />
  )
}

export type OptionsProps = {
  isOpen: boolean
} & SlotOffsetControlProps

export function Options({ isOpen, id, offsetMs }: OptionsProps) {
  const willChange = useWillChange()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={domAnimation}>
          <m.div
            key="slot-options"
            style={{ willChange }}
            initial="exit"
            animate="enter"
            exit="exit"
            variants={transitionVariants}
          >
            <div className="border-foreground-200 border-t-1 p-2">
              <SlotOffsetControl id={id} offsetMs={offsetMs} />
            </div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  )
}
