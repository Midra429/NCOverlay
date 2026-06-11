import type { GetCurrentData } from '@/entrypoints/page-primeVideo.content'
import type { setBadge } from '@/utils/extension/setBadge'

import { defineCustomEventMessaging } from '@webext-core/messaging/page'

export interface ProtocolMap {
  // page -> content
  'content:setBadge': (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>

  // content -> page
  'page:primeVideo:getCurrentData': (args?: null) => GetCurrentData | null
}

export const { sendMessage: sendPageMessage, onMessage: onPageMessage } =
  defineCustomEventMessaging<ProtocolMap>({
    namespace: `${EXT_BUILD_ID}:page`,
  })
