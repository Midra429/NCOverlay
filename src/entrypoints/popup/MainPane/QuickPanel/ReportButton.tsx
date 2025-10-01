import { ClipboardPenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'

import { useNcoState } from '@/hooks/useNco'

import { PanelButton } from '@/components/PanelButton'

export function ReportButton() {
  const stateVod = useNcoState('vod')
  const stateInfo = useNcoState('info')

  async function onPress() {
    const tab = await webext.getCurrentActiveTab()
    const url = await getFormsUrl({
      content: 'bug',
      vod: stateVod,
      info: stateInfo,
      url: stateVod && tab?.url,
    })

    webext.tabs.create({ url })
  }

  return (
    <PanelButton
      label="不具合報告"
      startContent={<ClipboardPenIcon />}
      onPress={onPress}
    />
  )
}
