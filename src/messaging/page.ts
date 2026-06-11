import type { PrimeVideoPlaybackInfo } from '@/entrypoints/page-primeVideo.content'
import type { UnextPlaybackInfo } from '@/entrypoints/page-unext.content'
import type { setBadge } from '@/utils/extension/setBadge'

import { defineCustomEventMessaging } from '@webext-core/messaging/page'

export interface ProtocolMap {
  // page -> content
  'content:setBadge': (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>

  // content -> page
  'page:primeVideo:getPlaybackInfo': (
    args?: null
  ) => PrimeVideoPlaybackInfo | null
  'page:unext:getPlaybackInfo': (args?: null) => UnextPlaybackInfo | null
}

export const { sendMessage: sendPageMessage, onMessage: onPageMessage } =
  defineCustomEventMessaging<ProtocolMap>({
    namespace: `${EXT_BUILD_ID}:page`,
  })
