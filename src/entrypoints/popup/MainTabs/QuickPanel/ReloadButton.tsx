import { RefreshCwIcon, SearchIcon } from 'lucide-react'

import { useNcoState } from '@/hooks/useNco'
import { useSettings } from '@/hooks/useSettings'
import { sendMessageToContent } from '@/messaging/to-content'

import { PanelButton } from '@/components/PanelButton'

export function ReloadButton() {
  const [manual] = useSettings('settings:autoSearch:manual')
  const stateStatus = useNcoState('status')

  const isLoading = stateStatus === 'searching' || stateStatus === 'loading'

  function onPress() {
    sendMessageToContent('reload', null)
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
