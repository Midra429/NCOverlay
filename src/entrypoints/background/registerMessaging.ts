import type { Browser } from '@/utils/webext'

import { webext } from '@/utils/webext'
import { captureTab } from '@/utils/extension/captureTab'
import { setBadge } from '@/utils/extension/setBadge'
import { onMessageInBackground } from '@/messaging/to-background'

export default function () {
  onMessageInBackground('getCurrentTab', ({ sender }) => {
    return sender.tab as Browser.tabs.Tab
  })

  onMessageInBackground('setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data,
    })
  })

  onMessageInBackground('captureTab', ({ sender, data }) => {
    return captureTab({
      windowId: sender.tab?.windowId,
      ...data,
    })
  })

  onMessageInBackground('openPopupWindow', async ({ sender, data }) => {
    await webext[data.type].openPopupWindow({
      tabId: sender.tab?.id,
      ...data.createData,
    })
  })
}
