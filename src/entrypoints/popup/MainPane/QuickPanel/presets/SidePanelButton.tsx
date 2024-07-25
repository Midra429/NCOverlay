import { useEffect, useState, useCallback } from 'react'
import { Button, Tooltip, cn } from '@nextui-org/react'
import { PanelRightOpenIcon, PanelRightCloseIcon } from 'lucide-react'

import { webext } from '@/utils/webext'

export const SidePanelButton: React.FC = () => {
  const [tabId, setTabId] = useState<number>()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      const tab = await webext.getCurrentActiveTab()

      if (tab) {
        const { enabled } = await webext.sidePanel.getOptions({
          tabId: tab.id,
        })

        setTabId(tab.id)
        setOpen(!!enabled)
      }
    })()
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
    <Tooltip
      classNames={{
        base: 'pointer-events-none max-w-48',
      }}
      size="sm"
      radius="sm"
      color="foreground"
      showArrow
      closeDelay={0}
      content={open ? '閉じる' : '開く'}
    >
      <Button
        className={cn(
          'border-1 border-foreground-100',
          'bg-content1 text-foreground',
          'shadow-small'
        )}
        fullWidth
        startContent={
          open ? (
            <PanelRightCloseIcon className="size-4" />
          ) : (
            <PanelRightOpenIcon className="size-4" />
          )
        }
        onPress={onPress}
      >
        サイドパネル
      </Button>
    </Tooltip>
  )
}
