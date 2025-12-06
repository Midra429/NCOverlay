import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'
import { Button } from '@heroui/react'
import { Settings2Icon, XIcon } from 'lucide-react'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useWillChange,
} from 'framer-motion'

import { TRANSITION_VARIANTS_ACCORDION } from '@/constants/framer-motion'
import { ncoState } from '@/hooks/useNco'

import { OffsetControl } from '@/components/OffsetControl'

export interface OptionsButtonProps {
  isOpen: boolean
  onPress: () => void
}

export function OptionsButton({ isOpen, onPress }: OptionsButtonProps) {
  return (
    <Button
      className="size-6! min-h-0 min-w-0"
      size="sm"
      radius="full"
      variant="flat"
      isIconOnly
      onPress={onPress}
    >
      {isOpen ? (
        <XIcon className="size-3.5" />
      ) : (
        <Settings2Icon className="size-3.5" />
      )}
    </Button>
  )
}

interface SlotOffsetControlProps {
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

export interface OptionsProps extends SlotOffsetControlProps {
  isOpen: boolean
}

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
            variants={TRANSITION_VARIANTS_ACCORDION}
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
