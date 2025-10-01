import { RefreshCwIcon } from 'lucide-react'

import { useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { PanelButton } from '@/components/PanelButton'

export function ReloadButton() {
  const stateStatus = useNcoState('status')

  const isLoading = stateStatus === 'searching' || stateStatus === 'loading'

  function onPress() {
    sendNcoMessage('reload', null)
  }

  return (
    <PanelButton
      label="再読み込み(自動検索)"
      startContent={!isLoading && <RefreshCwIcon />}
      isLoading={isLoading}
      onPress={onPress}
    />
  )
}
