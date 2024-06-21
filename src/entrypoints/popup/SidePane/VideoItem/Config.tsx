import type { Slot } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'
import { Button, cn } from '@nextui-org/react'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { ncoMessenger } from '@/ncoverlay/messaging'

import { OffsetControl } from '@/components/offset-control'

export type ConfigProps = {
  slot: Slot
}

export const Config: React.FC<ConfigProps> = ({ slot }) => {
  const [offset, setOffset] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setOffset(Math.round((slot?.offset ?? 0) / 1000))
  }, [slot])

  return isOpen ? (
    <div className="absolute inset-0 z-10 flex flex-col bg-content1 p-1.5">
      <OffsetControl
        compact
        value={offset}
        onValueChange={(val) => setOffset(val)}
        onApply={async () => {
          if (!slot) return

          const tab = await webext.getCurrentActiveTab()

          ncoMessenger
            .sendMessage('p-c:setOffset', [slot.id, offset * 1000], tab?.id)
            .catch(() => {})
        }}
      />

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
