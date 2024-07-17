import type { NCOverlay } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

// popup, background -> content

type ProtocolMap = {
  getId: (args?: null) => string | null

  updateRendererThreads: (args?: null) => void

  updateSlot: (
    args: Parameters<NCOverlay['updateSlot']>
  ) => ReturnType<NCOverlay['updateSlot']>

  setGlobalOffset: (
    args: Parameters<NCOverlay['setGlobalOffset']>
  ) => ReturnType<NCOverlay['setGlobalOffset']>

  jumpMarker: (
    args: Parameters<NCOverlay['jumpMarker']>
  ) => ReturnType<NCOverlay['jumpMarker']>
}

export const ncoMessenger = defineExtensionMessaging<ProtocolMap>()
