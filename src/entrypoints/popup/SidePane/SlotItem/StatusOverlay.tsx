import type { StateSlotDetail } from '@/ncoverlay/state'

import { Spinner, cn } from '@nextui-org/react'

export type StatusOverlayProps = {
  status: StateSlotDetail['status']
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({ status }) => {
  if (status === 'ready' || status === 'error') return

  return (
    <div
      className={cn(
        'absolute inset-0 z-10',
        'flex size-full items-center justify-center',
        'bg-foreground/50 backdrop-blur-[1px]',
        'rounded-md',
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
