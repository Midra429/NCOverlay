import type { NCOverlay } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

type ProtocolMap = {
  // popup -> content
  'p-c:getId': (args?: null) => string | null

  'p-c:updateRendererThreads': (args?: null) => void

  'p-c:updateSlot': (
    args: Parameters<NCOverlay['updateSlot']>
  ) => ReturnType<NCOverlay['updateSlot']>

  'p-c:setGlobalOffset': (
    args: Parameters<NCOverlay['setGlobalOffset']>
  ) => ReturnType<NCOverlay['setGlobalOffset']>

  'p-c:jumpMarker': (
    args: Parameters<NCOverlay['jumpMarker']>
  ) => ReturnType<NCOverlay['jumpMarker']>
}

export const ncoMessenger = defineExtensionMessaging<ProtocolMap>()
