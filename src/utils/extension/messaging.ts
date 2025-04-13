import type { Tabs } from 'webextension-polyfill'
import type { setBadge } from './setBadge'
import type { captureTab } from './captureTab'

import { defineExtensionMessaging } from '@webext-core/messaging'

// content -> background

type ProtocolMap = {
  getCurrentTab: (args?: null) => Tabs.Tab

  setBadge: (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>

  captureTab: (
    args: Parameters<typeof captureTab>[0]
  ) => Awaited<ReturnType<typeof captureTab>>
}

export const utilsMessenger = defineExtensionMessaging<ProtocolMap>()

export const sendUtilsMessage = utilsMessenger.sendMessage
