import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState, useCallback } from 'react'
import { Button, cn } from '@nextui-org/react'
import { BlendIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

import { Tooltip } from '@/components/tooltip'

export const TranslucentButton: React.FC<{ detail: StateSlotDetail }> = ({
  detail,
}) => {
  const [translucent, setTranslucent] = useState(true)

  useEffect(() => {
    setTranslucent(!!detail.translucent)
  }, [detail.translucent])

  const onPress = useCallback(async () => {
    setTranslucent((val) => !val)

    await ncoState?.update('slotDetails', ['id'], {
      id: detail.id,
      translucent: !translucent,
    })
  }, [detail.id, translucent])

  return (
    <Tooltip placement="left" content={translucent ? '半透明を解除' : '半透明'}>
      <Button
        className={cn(
          '!size-6 min-h-0 min-w-0',
          !translucent && 'text-foreground-700'
        )}
        size="sm"
        radius="full"
        variant={translucent ? 'solid' : 'light'}
        color={translucent ? 'primary' : 'default'}
        isIconOnly
        isDisabled={detail.hidden}
        startContent={<BlendIcon className="size-3.5" />}
        onPress={onPress}
      />
    </Tooltip>
  )
}
