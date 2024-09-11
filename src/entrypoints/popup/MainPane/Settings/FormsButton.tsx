import { useCallback } from 'react'
import { ClipboardPenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'

import { useNcoState } from '@/hooks/useNco'

import { IconLink } from '@/components/icon-link'

export const FormsButton: React.FC = () => {
  const stateVod = useNcoState('vod')
  const stateInfo = useNcoState('info')

  const onPress = useCallback(async () => {
    const tab = await webext.getCurrentActiveTab()
    const url = await getFormsUrl({
      vod: stateVod,
      info: stateInfo,
      url: stateVod && tab?.url,
    })

    webext.tabs.create({ url })
  }, [stateVod, stateInfo])

  return (
    <IconLink
      icon={ClipboardPenIcon}
      title="不具合報告・機能提案"
      onPress={onPress}
    />
  )
}
