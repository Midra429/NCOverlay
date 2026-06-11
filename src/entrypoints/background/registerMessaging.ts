import type { Browser } from '@/utils/webext'

import { webext } from '@/utils/webext'
import { captureTab } from '@/utils/extension/captureTab'
import { setBadge } from '@/utils/extension/setBadge'
import { onExtensionMessage } from '@/messaging/extension'

export default function () {
  onExtensionMessage('bg:getCurrentTab', ({ sender }) => {
    return sender.tab as Browser.tabs.Tab
  })

  onExtensionMessage('bg:setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data,
    })
  })

  onExtensionMessage('bg:captureTab', ({ sender, data }) => {
    return captureTab({
      windowId: sender.tab?.windowId,
      ...data,
    })
  })

  onExtensionMessage('bg:openPopout', async ({ sender, data }) => {
    await webext[data.type].openPopout({
      tabId: sender.tab?.id,
      ...data.createData,
    })
  })
}
