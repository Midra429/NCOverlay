import type { StateSlotDetail } from '@/ncoverlay/state'

import { Spinner, cn } from '@heroui/react'

export type StatusOverlayProps = {
  status: StateSlotDetail['status']
}

export function StatusOverlay({ status }: StatusOverlayProps) {
  if (status === 'ready' || status === 'error') return

  return (
    <div
      className={cn(
        'absolute inset-[1px] z-10',
        'flex items-center justify-center',
        'bg-foreground/50 backdrop-blur-[1px]',
        'rounded-lg',
        'pointer-events-none'
      )}
    >
      <Spinner
        classNames={{
          circle1: 'border-b-background',
          circle2: 'border-b-background',
        }}
      />
    </div>
  )
}
