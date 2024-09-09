import type { Variants } from 'framer-motion'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@nextui-org/react'
import { TRANSITION_VARIANTS } from '@nextui-org/framer-utils'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  useWillChange,
  m,
} from 'framer-motion'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

import { OffsetControl } from '@/components/offset-control'

const transitionVariants: Variants = {
  exit: { ...TRANSITION_VARIANTS.collapse.exit, overflowY: 'hidden' },
  enter: { ...TRANSITION_VARIANTS.collapse.enter, overflowY: 'unset' },
}

export const ConfigButton: React.FC<{
  isOpen: boolean
  onPress: () => void
}> = ({ isOpen, onPress }) => {
  return (
    <Button
      className="!size-6 min-h-0 min-w-0"
      size="sm"
      radius="full"
      variant="flat"
      isIconOnly
      startContent={
        isOpen ? (
          <XIcon className="size-3.5" />
        ) : (
          <SlidersHorizontalIcon className="size-3.5" />
        )
      }
      onPress={onPress}
    />
  )
}

type SlotOffsetControlProps = {
  id: StateSlotDetail['id']
  offsetMs: StateSlotDetail['offsetMs']
}

const SlotOffsetControl: React.FC<SlotOffsetControlProps> = ({
  id,
  offsetMs,
}) => {
  const [currentOffset, setCurrentOffset] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const ofs = Math.round((offsetMs ?? 0) / 1000)

    if (ofs !== currentOffset) {
      setCurrentOffset(ofs)
      setOffset(ofs)
    }
  }, [offsetMs])

  const onApply = useCallback(async () => {
    await ncoState?.update('slotDetails', ['id'], {
      id,
      offsetMs: offset * 1000,
    })
  }, [id, offset])

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

export type ConfigProps = {
  isOpen: boolean
} & SlotOffsetControlProps

export const Config: React.FC<ConfigProps> = ({ isOpen, id, offsetMs }) => {
  const willChange = useWillChange()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <LazyMotion features={domAnimation}>
          <m.div
            key="slot-config"
            style={{ willChange }}
            initial="exit"
            animate="enter"
            exit="exit"
            variants={transitionVariants}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="border-t-1 border-divider p-2">
              <SlotOffsetControl id={id} offsetMs={offsetMs} />
            </div>
          </m.div>
        </LazyMotion>
      )}
    </AnimatePresence>
  )
}
