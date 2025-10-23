import { Button, cn } from '@heroui/react'
import { PlusIcon } from 'lucide-react'

export interface AddButtonProps {
  onPress: () => void
}

export function AddButton({ onPress }: AddButtonProps) {
  return (
    <div
      className={cn(
        'absolute inset-px z-10',
        'flex items-center justify-center',
        'bg-background/50 backdrop-blur-xs',
        'rounded-lg',
        'cursor-pointer',
        'opacity-0 hover:opacity-100',
        'transition-opacity'
      )}
      onClick={onPress}
    >
      <Button
        size="sm"
        radius="full"
        color="primary"
        isIconOnly
        onPress={onPress}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  )
}
