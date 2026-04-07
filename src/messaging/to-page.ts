import type { GetCurrentData } from '@/entrypoints/page-primeVideo.content'

import { defineWindowMessaging } from '@webext-core/messaging/page'

export interface ProtocolMap {
  getCurrentData: (args?: null) => GetCurrentData | null
}

export const { sendMessage: sendMessageToPage, onMessage: onMessageInPage } =
  defineWindowMessaging<ProtocolMap>({
    namespace: `${EXT_BUILD_ID}:to-page`,
  })
