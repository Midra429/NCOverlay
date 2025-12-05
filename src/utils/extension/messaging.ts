import type { Browser } from '@/utils/webext'
import type { setBadge } from './setBadge'
import type { captureTab } from './captureTab'

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
}

export const utilsMessenger = defineExtensionMessaging<ProtocolMap>()

export const sendUtilsMessage = utilsMessenger.sendMessage
