import type { Browser } from '@/utils/webext'

import { captureTab } from '@/utils/extension/captureTab'
import { onUtilsMessage } from '@/utils/extension/messaging'
import { setBadge } from '@/utils/extension/setBadge'

export default function () {
  onUtilsMessage('getCurrentTab', ({ sender }) => {
    return sender.tab as Browser.tabs.Tab
  })

  onUtilsMessage('setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data,
    })
  })

  onUtilsMessage('captureTab', ({ sender, data }) => {
    return captureTab({
      windowId: sender.tab?.windowId,
      ...data,
    })
  })
}
