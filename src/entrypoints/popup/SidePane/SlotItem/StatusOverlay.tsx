import type { StateStatus } from '@/ncoverlay/state'

import { Spinner, cn } from '@nextui-org/react'

export const StatusOverlay: React.FC<{ status: StateStatus }> = ({
  status,
}) => {
  if (status === 'ready' || status === 'error') return

  return (
    <div
      className={cn(
        'absolute inset-0 z-10',
        'flex h-full w-full items-center justify-center',
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
