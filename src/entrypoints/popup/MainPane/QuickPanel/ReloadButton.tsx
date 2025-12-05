import { RefreshCwIcon, SearchIcon } from 'lucide-react'

import { useNcoState } from '@/hooks/useNco'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import { PanelButton } from '@/components/PanelButton'
import { useSettings } from '@/hooks/useSettings'

export function ReloadButton() {
  const [manual] = useSettings('settings:autoSearch:manual')
  const stateStatus = useNcoState('status')

  const isLoading = stateStatus === 'searching' || stateStatus === 'loading'

  function onPress() {
    sendNcoMessage('reload', null)
  }

  return (
    <PanelButton
      label={manual ? '自動検索' : '再読み込み'}
      startContent={!isLoading && (manual ? <SearchIcon /> : <RefreshCwIcon />)}
      isLoading={isLoading}
      onPress={onPress}
    />
  )
}
