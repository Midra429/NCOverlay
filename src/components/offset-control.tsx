import { Button, Divider, Input, cn } from '@nextui-org/react'
import { RotateCcwIcon, CheckIcon } from 'lucide-react'

export type OffsetControlProps = {
  value: number
  onValueChange: (value: number) => void
  onApply: () => void
  compact?: boolean
}

export const OffsetControl: React.FC<OffsetControlProps> = ({
  value,
  onValueChange,
  onApply,
  compact,
}) => {
  return (
    <div className={cn('flex h-fit gap-2', compact ? 'flex-row' : 'flex-col')}>
      <div className="flex flex-row items-start justify-start gap-1.5">
        {[-10, -5, -1].map((sec) => (
          <Button
            key={sec}
            size="sm"
            variant="flat"
            radius="full"
            isIconOnly
            onPress={() => onValueChange(value + sec)}
          >
            {sec}
          </Button>
        ))}

        <Input
          classNames={{
            input: 'text-right [&::-webkit-inner-spin-button]:appearance-none',
          }}
          type="number"
          size="sm"
          placeholder="0"
          endContent="秒"
          value={value.toString()}
          onValueChange={(val) => onValueChange(Number(val))}
        />

        {[1, 5, 10].map((sec) => (
          <Button
            key={sec}
            size="sm"
            variant="flat"
            radius="full"
            isIconOnly
            onPress={() => onValueChange(value + sec)}
          >
            +{sec}
          </Button>
        ))}
      </div>

      {compact && <Divider className="h-8" orientation="vertical" />}

      <div className={cn('flex flex-row gap-2', !compact && 'justify-between')}>
        <Button
          size="sm"
          variant="flat"
          fullWidth
          isIconOnly={compact}
          onPress={() => onValueChange(0)}
        >
          <RotateCcwIcon className="size-4" />
          {!compact && <span>リセット</span>}
        </Button>

        <Button
          size="sm"
          variant="solid"
          color="primary"
          fullWidth
          isIconOnly={compact}
          onPress={onApply}
        >
          <CheckIcon className="size-4" />
          {!compact && <span>適用</span>}
        </Button>
      </div>
    </div>
  )
}
