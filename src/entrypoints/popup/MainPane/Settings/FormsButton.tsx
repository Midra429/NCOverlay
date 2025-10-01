import { ClipboardPenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'

import { useNcoState } from '@/hooks/useNco'

import { IconLink } from '@/components/IconLink'

export function FormsButton() {
  const stateVod = useNcoState('vod')
  const stateInfo = useNcoState('info')

  async function onPress() {
    const tab = await webext.getCurrentActiveTab()
    const url = await getFormsUrl({
      vod: stateVod,
      info: stateInfo,
      url: stateVod && tab?.url,
    })

    webext.tabs.create({ url })
  }

  return (
    <IconLink
      Icon={ClipboardPenIcon}
      title="不具合報告・機能提案"
      onPress={onPress}
    />
  )
}
