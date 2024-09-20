import { useEffect, useState, useCallback } from 'react'
import { PanelRightOpenIcon, PanelRightCloseIcon } from 'lucide-react'

import { webext } from '@/utils/webext'

import { Tooltip } from '@/components/tooltip'
import { PanelButton } from '@/components/panel-button'

export const SidePanelButton: React.FC = () => {
  const [tabId, setTabId] = useState<number>()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    webext.getCurrentActiveTab().then(async (tab) => {
      if (!tab) return

      const { enabled } = await webext.sidePanel.getOptions({
        tabId: tab.id,
      })

      setTabId(tab.id)
      setOpen(!!enabled)
    })
  }, [])

  const onPress = useCallback(() => {
    const enabled = !open

    if (typeof tabId === 'number') {
      if (enabled) {
        webext.sidePanel.open({ tabId })
      } else {
        webext.sidePanel.close({ tabId })
      }
    }

    setOpen(enabled)
  }, [tabId, open])

  return (
    <PanelButton
      label={`コメント一覧を${open ? '閉じる' : '開く'}`}
      startContent={open ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
      onPress={onPress}
    />
  )
}
