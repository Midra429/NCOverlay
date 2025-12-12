import type { captureTab } from '@/utils/extension/captureTab'
import type { setBadge } from '@/utils/extension/setBadge'
import type { Browser } from '@/utils/webext'

import { defineToBackgroundMessaging } from '@/utils/messaging/to-background'

export interface ProtocolMap {
  getCurrentTab: (args?: null) => Browser.tabs.Tab

  setBadge: (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>

  captureTab: (
    args: Parameters<typeof captureTab>[0]
  ) => Awaited<ReturnType<typeof captureTab>>

  openPopupWindow: (args: {
    type: 'action' | 'sidePanel'
    createData: Browser.OpenPopupWindowCreateData
  }) => void

  timeupdate: (args: { id: number; time: number }) => void
}

export const {
  sendMessage: sendMessageToBackground,
  onMessage: onMessageInBackground,
} = defineToBackgroundMessaging<ProtocolMap>()

sendMessageToBackground('getCurrentTab', null)
