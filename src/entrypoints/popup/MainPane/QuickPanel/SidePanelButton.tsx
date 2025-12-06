import { useEffect, useState } from 'react'
import { PanelRightCloseIcon, PanelRightOpenIcon } from 'lucide-react'

import { webext } from '@/utils/webext'

import { PanelButton } from '@/components/PanelButton'

export function SidePanelButton() {
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

  function onPress() {
    const enabled = !open

    if (typeof tabId === 'number') {
      if (enabled) {
        webext.sidePanel.open({ tabId })
      } else {
        webext.sidePanel.close({ tabId })
      }
    }

    setOpen(enabled)
  }

  return (
    <PanelButton
      label={`コメントリストを${open ? '閉じる' : '開く'}`}
      startContent={open ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
      onPress={onPress}
    />
  )
}
