import type { ProtocolMap } from '..'

import { defineWindowMessaging } from '@webext-core/messaging/page'

export const { onMessage: onProxyMessage, sendMessage: sendProxyMessage } =
  defineWindowMessaging<ProtocolMap>({
    namespace: `${EXT_BUILD_ID}:proxy-service`,
  })
