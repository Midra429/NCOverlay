import type {
  CatalogQueueItem,
  PlaybackUrlsQueueItem,
} from '@/entrypoints/page-primeVideo.content'

import { defineWindowMessaging } from '@webext-core/messaging/page'

export interface ProtocolMap {
  getCurrentData: (
    args?: null
  ) => (PlaybackUrlsQueueItem & CatalogQueueItem) | null
}

export const { sendMessage: sendMessageToPage, onMessage: onMessageInPage } =
  defineWindowMessaging<ProtocolMap>({
    namespace: `${EXT_BUILD_ID}:to-page`,
  })
