import type { StateSlotDetail } from '@/ncoverlay/state'

import { Button, cn } from '@heroui/react'
import { Trash2Icon } from 'lucide-react'

export interface ButtonsOverlayProps {
  status: StateSlotDetail['status']
  onRemove: () => void
}

export function ButtonsOverlay({ status, onRemove }: ButtonsOverlayProps) {
  if (status !== 'ready' && status !== 'error') return

  return (
    <div
      className={cn(
        'absolute inset-px z-10',
        'opacity-0! hover:opacity-100!',
        'transition-opacity'
      )}
    >
      {/* 削除 */}
      <Button
        className={cn(
          'absolute top-px right-px',
          'size-6! min-h-0 min-w-0',
          'border-1 border-white/80'
        )}
        size="sm"
        radius="full"
        variant="solid"
        color="danger"
        isIconOnly
        onPress={onRemove}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  )
}
