import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState, useCallback } from 'react'
import { Button, Tooltip, cn } from '@nextui-org/react'
import { EyeOffIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

export const HideButton: React.FC<{ detail: StateSlotDetail }> = ({
  detail,
}) => {
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    setHidden(!!detail.hidden)
  }, [detail.hidden])

  const onPress = useCallback(async () => {
    setHidden((val) => !val)

    await ncoState?.update('slotDetails', ['id'], {
      id: detail.id,
      hidden: !hidden,
    })
  }, [detail.id, hidden])

  return (
    <Tooltip
      classNames={{
        base: 'pointer-events-none max-w-48',
      }}
      placement="left"
      size="sm"
      radius="sm"
      color="foreground"
      showArrow
      closeDelay={0}
      content={hidden ? '表示' : '非表示'}
    >
      <Button
        className={cn(
          '!size-6 min-h-0 min-w-0',
          !hidden && 'text-foreground-700'
        )}
        size="sm"
        radius="full"
        variant={hidden ? 'solid' : 'light'}
        color={hidden ? 'primary' : 'default'}
        isIconOnly
        startContent={<EyeOffIcon className="size-3.5" />}
        onPress={onPress}
      />
    </Tooltip>
  )
}
