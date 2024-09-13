import { Button, cn } from '@nextui-org/react'
import { PlusIcon } from 'lucide-react'

export type AddButtonProps = {
  onPress: () => void
}

export const AddButton: React.FC<AddButtonProps> = ({ onPress }) => {
  return (
    <div
      className={cn(
        'absolute inset-[1px] z-10',
        'flex items-center justify-center',
        'bg-background/50 backdrop-blur-sm',
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
        startContent={<PlusIcon className="size-4" />}
        onPress={onPress}
      />
    </div>
  )
}
