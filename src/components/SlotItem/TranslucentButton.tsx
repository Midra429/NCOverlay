import type { StateSlotDetail } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'
import { Button, cn } from '@heroui/react'
import { BlendIcon } from 'lucide-react'

import { ncoState } from '@/hooks/useNco'

import { Tooltip } from '@/components/Tooltip'

export interface TranslucentButton {
  id: StateSlotDetail['id']
  hidden: StateSlotDetail['hidden']
  translucent: StateSlotDetail['translucent']
}

export function TranslucentButton({
  id,
  hidden,
  translucent,
}: TranslucentButton) {
  const [tmpTranslucent, setTmpTranslucent] = useState(false)

  useEffect(() => {
    setTmpTranslucent(!!translucent)
  }, [translucent])

  async function onPress() {
    setTmpTranslucent((val) => !val)

    await ncoState?.update('slotDetails', ['id'], {
      id,
      translucent: !tmpTranslucent,
    })
  }

  return (
    <Tooltip
      placement="left"
      content={tmpTranslucent ? '半透明を解除' : '半透明'}
    >
      <Button
        className={cn(
          'size-6! min-h-0 min-w-0',
          !tmpTranslucent && 'text-foreground-700'
        )}
        size="sm"
        radius="full"
        variant={tmpTranslucent ? 'solid' : 'light'}
        color={tmpTranslucent ? 'primary' : 'default'}
        isIconOnly
        isDisabled={hidden}
        onPress={onPress}
      >
        <BlendIcon className="size-3.5" />
      </Button>
    </Tooltip>
  )
}
