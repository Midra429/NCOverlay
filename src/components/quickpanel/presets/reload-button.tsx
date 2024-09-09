import { useMemo, useCallback } from 'react'
import { Button, cn } from '@nextui-org/react'
import { RotateCw } from 'lucide-react'

import { useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

export const ReloadButton: React.FC = () => {
  const stateStatus = useNcoState('status')

  const isLoading = useMemo(() => {
    return stateStatus === 'searching' || stateStatus === 'loading'
  }, [stateStatus])

  const onPress = useCallback(() => {
    sendNcoMessage('reload', null)
  }, [])

  return (
    <Button
      className={cn(
        'border-1 border-foreground-100',
        'bg-content1 text-foreground',
        'shadow-small'
      )}
      fullWidth
      isLoading={isLoading}
      startContent={!isLoading && <RotateCw className="size-4" />}
      onPress={onPress}
    >
      {(stateStatus === 'searching' && '検索中...') ||
        (stateStatus === 'loading' && '読み込み中...') ||
        '再読み込み'}
    </Button>
  )
}
