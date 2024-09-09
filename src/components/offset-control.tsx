import { useCallback } from 'react'
import { Button, Divider, Input, cn } from '@nextui-org/react'
import { RotateCcwIcon, CheckIcon } from 'lucide-react'

export type OffsetControlProps = {
  value: number
  isValueChanged?: boolean
  compact?: boolean
  onValueChange: (value: number) => void
  onApply: () => void
}

export const OffsetControl: React.FC<OffsetControlProps> = ({
  value,
  onValueChange,
  onApply,
  isValueChanged,
  compact,
}) => {
  const onValueChangeInput = useCallback((val: string) => {
    onValueChange(Number(val))
  }, [])

  const onPressReset = useCallback(() => {
    onValueChange(0)
  }, [])

  return (
    <div className={cn('flex h-fit gap-2', compact ? 'flex-row' : 'flex-col')}>
      <div className="flex flex-row gap-1.5">
        {[-30, -10, -1].map((sec) => (
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
            input: cn(
              'text-right',
              '[appearance:textfield]',
              '[&::-webkit-inner-spin-button]:appearance-none',
              '[&::-webkit-outer-spin-button]:appearance-none'
            ),
          }}
          type="number"
          size="sm"
          placeholder="0"
          endContent="秒"
          value={value.toString()}
          onValueChange={onValueChangeInput}
        />

        {[1, 10, 30].map((sec) => (
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
          isDisabled={value === 0}
          startContent={<RotateCcwIcon className="size-4" />}
          onPress={onPressReset}
        >
          {!compact && <span>リセット</span>}
        </Button>

        <Button
          size="sm"
          variant="solid"
          color="primary"
          fullWidth
          isIconOnly={compact}
          isDisabled={isValueChanged === false}
          startContent={<CheckIcon className="size-4" />}
          onPress={onApply}
        >
          {!compact && <span>適用</span>}
        </Button>
      </div>
    </div>
  )
}
