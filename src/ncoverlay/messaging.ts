import type { NCOverlay } from '.'

import { defineExtensionMessaging } from '@webext-core/messaging'

type ProtocolMap = {
  // popup -> content
  'p-c:getId': (args?: null) => string | null
  'p-c:setOffset': (args: Parameters<NCOverlay['setOffset']>) => void
  'p-c:setGlobalOffset': (
    args: Parameters<NCOverlay['setGlobalOffset']>
  ) => void
  'p-c:jumpMarker': (args: Parameters<NCOverlay['jumpMarker']>) => void
}

export const ncoMessenger = defineExtensionMessaging<ProtocolMap>()
