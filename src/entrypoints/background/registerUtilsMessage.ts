import { utilsMessenger } from '@/utils/extension/messaging'
import { setBadge } from '@/utils/extension/setBadge'
import { captureTab } from '@/utils/extension/captureTab'

export default function () {
  utilsMessenger.onMessage('getCurrentTab', ({ sender }) => {
    return sender.tab
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
