import { Button, cn } from '@nextui-org/react'
import { SlidersHorizontalIcon } from 'lucide-react'

export const ConfigButton: React.FC = () => {
  return (
    <Button
      className={cn('absolute bottom-1 right-1', '!size-6 min-h-0 min-w-0')}
      size="sm"
      radius="full"
      variant="flat"
      isIconOnly
      startContent={<SlidersHorizontalIcon className="size-3.5" />}
    />
  )
}
