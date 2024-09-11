import { useMemo, useCallback } from 'react'
import { RefreshCwIcon } from 'lucide-react'

import { useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { PanelButton } from '@/components/panel-button'

export const ReloadButton: React.FC = () => {
  const stateStatus = useNcoState('status')

  const isLoading = useMemo(() => {
    return stateStatus === 'searching' || stateStatus === 'loading'
  }, [stateStatus])

  const onPress = useCallback(() => {
    sendNcoMessage('reload', null)
  }, [])

  return (
    <PanelButton
      compact
      isLoading={isLoading}
      startContent={!isLoading && <RefreshCwIcon className="size-4" />}
      onPress={onPress}
    >
      再読み込み
    </PanelButton>
  )
}
