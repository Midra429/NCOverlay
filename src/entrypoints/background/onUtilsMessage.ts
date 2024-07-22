import { utilsMessenger } from '@/utils/extension/messaging'
import { setBadge } from '@/utils/extension/setBadge'

export default () => {
  utilsMessenger.onMessage('getCurrentTab', ({ sender }) => {
    return sender.tab
  })

  utilsMessenger.onMessage('setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data[0],
    })
  })
}
