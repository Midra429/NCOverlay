import { utilsMessenger } from '@/utils/messaging'
import { setBadge } from '@/utils/extension/setBadge'

export default () => {
  utilsMessenger.onMessage('c-b:getCurrentTab', ({ sender }) => {
    return sender.tab
  })

  utilsMessenger.onMessage('c-b:setBadge', ({ sender, data }) => {
    return setBadge({
      tabId: sender.tab?.id,
      ...data[0],
    })
  })
}
