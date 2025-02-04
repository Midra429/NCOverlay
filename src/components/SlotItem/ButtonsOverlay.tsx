import type { StateSlotDetail } from '@/ncoverlay/state'

import { Button, cn } from "@heroui/react"
import { Trash2Icon } from 'lucide-react'

export type ButtonsOverlayProps = {
  status: StateSlotDetail['status']
  onRemove: () => void
}

export const ButtonsOverlay: React.FC<ButtonsOverlayProps> = ({
  status,
  onRemove,
}) => {
  if (status !== 'ready' && status !== 'error') return

  return (
    <div
      className={cn(
        'absolute inset-[1px] z-10',
        'opacity-0 hover:opacity-100',
        'transition-opacity'
      )}
    >
      {/* 削除 */}
      <Button
        className={cn(
          'absolute right-[1px] top-[1px]',
          '!size-6 min-h-0 min-w-0',
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
