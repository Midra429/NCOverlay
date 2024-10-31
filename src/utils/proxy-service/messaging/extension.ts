import type { ProtocolMap } from '..'

import { defineExtensionMessaging } from '@webext-core/messaging'

export const { onMessage, sendMessage } =
  defineExtensionMessaging<ProtocolMap>()
