import type { Variants } from 'framer-motion'
import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState, useCallback, useMemo } from 'react'
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

export type ConfigProps = {
  detail: StateSlotDetail
  isOpen: boolean
}

export const Config: React.FC<ConfigProps> = ({ detail, isOpen }) => {
  const willChange = useWillChange()

  const content = useMemo(() => {
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
                <SlotOffsetControl detail={detail} />
              </div>
            </m.div>
          </LazyMotion>
        )}
      </AnimatePresence>
    )
  }, [isOpen, detail])

  return content
}
