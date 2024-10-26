import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState, useCallback } from 'react'
import { Button, cn } from '@nextui-org/react'
import { BlendIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

import { Tooltip } from '@/components/Tooltip'

export type TranslucentButton = {
  id: StateSlotDetail['id']
  hidden: StateSlotDetail['hidden']
  translucent: StateSlotDetail['translucent']
}

export const TranslucentButton: React.FC<TranslucentButton> = ({
  id,
  hidden,
  translucent,
}) => {
  const [tmpTranslucent, setTmpTranslucent] = useState(false)

  useEffect(() => {
    setTmpTranslucent(!!translucent)
  }, [translucent])

  const onPress = useCallback(async () => {
    setTmpTranslucent((val) => !val)

    await ncoState?.update('slotDetails', ['id'], {
      id,
      translucent: !tmpTranslucent,
    })
  }, [id, tmpTranslucent])

  return (
    <Tooltip
      placement="left"
      content={tmpTranslucent ? '半透明を解除' : '半透明'}
    >
      <Button
        className={cn(
          '!size-6 min-h-0 min-w-0',
          !tmpTranslucent && 'text-foreground-700'
        )}
        size="sm"
        radius="full"
        variant={tmpTranslucent ? 'solid' : 'light'}
        color={tmpTranslucent ? 'primary' : 'default'}
        isIconOnly
        isDisabled={hidden}
        startContent={<BlendIcon className="size-3.5" />}
        onPress={onPress}
      />
    </Tooltip>
  )
}
