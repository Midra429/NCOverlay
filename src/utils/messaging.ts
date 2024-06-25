import type { Tabs } from 'wxt/browser'
import type { setBadge } from '@/utils/extension/setBadge'

import { defineExtensionMessaging } from '@webext-core/messaging'

type ProtocolMap = {
  // content -> background
  'c-b:getCurrentTab': (args?: null) => Tabs.Tab

  'c-b:setBadge': (
    args: Parameters<typeof setBadge>
  ) => ReturnType<typeof setBadge>
}

export const utilsMessenger = defineExtensionMessaging<ProtocolMap>()
