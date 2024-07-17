import type { Tabs } from 'wxt/browser'
import type { setBadge } from '@/utils/extension/setBadge'

import { defineExtensionMessaging } from '@webext-core/messaging'

// content -> background

type ProtocolMap = {
  getCurrentTab: (args?: null) => Tabs.Tab

  setBadge: (args: Parameters<typeof setBadge>) => ReturnType<typeof setBadge>
}

export const utilsMessenger = defineExtensionMessaging<ProtocolMap>()
