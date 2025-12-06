import type { Browser } from '@/utils/webext'

import { captureTab } from '@/utils/extension/captureTab'
import { utilsMessenger } from '@/utils/extension/messaging'
import { setBadge } from '@/utils/extension/setBadge'

export default function () {
  utilsMessenger.onMessage('getCurrentTab', ({ sender }) => {
    return sender.tab as Browser.tabs.Tab
  })

  utilsMessenger.onMessage('setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data,
    })
  })

  utilsMessenger.onMessage('captureTab', ({ sender, data }) => {
    return captureTab({
      windowId: sender.tab?.windowId,
      ...data,
    })
  })
}
