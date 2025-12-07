import type { Browser } from '@/utils/webext'
import type { captureTab } from './captureTab'
import type { setBadge } from './setBadge'

import { defineExtensionMessaging } from '@webext-core/messaging'

// content -> background

interface ProtocolMap {
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
}

export const { onMessage: onUtilsMessage, sendMessage: sendUtilsMessage } =
  defineExtensionMessaging<ProtocolMap>()
