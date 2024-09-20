import { useCallback } from 'react'
import { ClipboardPenIcon } from 'lucide-react'

import { getFormsUrl } from '@/utils/extension/getFormsUrl'
import { webext } from '@/utils/webext'

import { useNcoState } from '@/hooks/useNco'

import { PanelButton } from '@/components/panel-button'

export const ReportButton: React.FC = () => {
  const stateVod = useNcoState('vod')
  const stateInfo = useNcoState('info')

  const onPress = useCallback(async () => {
    const tab = await webext.getCurrentActiveTab()
    const url = await getFormsUrl({
      content: 'bug',
      vod: stateVod,
      info: stateInfo,
      url: stateVod && tab?.url,
    })

    webext.tabs.create({ url })
  }, [stateVod, stateInfo])

  return (
    <PanelButton
      label="不具合報告"
      startContent={<ClipboardPenIcon />}
      onPress={onPress}
    />
  )
}
