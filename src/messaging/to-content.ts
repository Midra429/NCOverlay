import type { NCOverlay } from '@/ncoverlay'
import type { StorageItems } from '@/types/storage'

import { defineToContentMessaging } from '@/utils/messaging/to-content'

export interface ProtocolMap {
  getNcoId: (args?: null) => number | null

  getCurrentTime: (args?: null) => number

  reload: (args?: null) => void

  jumpMarker: (
    args: Parameters<NCOverlay['jumpMarker']>[0]
  ) => ReturnType<NCOverlay['jumpMarker']>

  capture: (format: StorageItems['settings:capture:format']) => {
    format: 'jpeg' | 'png'
    data?: number[]
  }
}

export const {
  sendMessage: sendMessageToContent,
  onMessage: onMessageInContent,
} = defineToContentMessaging<ProtocolMap>()
