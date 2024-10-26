import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState, useCallback } from 'react'
import { Button, cn } from '@nextui-org/react'
import { EyeOffIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

import { Tooltip } from '@/components/Tooltip'

export type HideButtonProps = {
  id: StateSlotDetail['id']
  hidden: StateSlotDetail['hidden']
}

export const HideButton: React.FC<HideButtonProps> = ({ id, hidden }) => {
  const [tmpHidden, setTmpHidden] = useState(false)

  useEffect(() => {
    setTmpHidden(!!hidden)
  }, [hidden])

  const onPress = useCallback(async () => {
    setTmpHidden((val) => !val)

    await ncoState?.update('slotDetails', ['id'], {
      id,
      hidden: !tmpHidden,
    })
  }, [id, tmpHidden])

  return (
    <Tooltip placement="left" content={tmpHidden ? '表示' : '非表示'}>
      <Button
        className={cn(
          '!size-6 min-h-0 min-w-0',
          !tmpHidden && 'text-foreground-700'
        )}
        size="sm"
        radius="full"
        variant={tmpHidden ? 'solid' : 'light'}
        color={tmpHidden ? 'primary' : 'default'}
        isIconOnly
        onPress={onPress}
      >
        <EyeOffIcon className="size-3.5" />
      </Button>
    </Tooltip>
  )
}
