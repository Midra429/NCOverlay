import { defineExtensionMessaging } from '@webext-core/messaging'

type ProtocolMap = {
  // popup -> content
  'p-c:getId': (args?: null) => string | null
  'p-c:jumpMarker': (markerIdx: number | null) => void
}

export const ncoMessenger = defineExtensionMessaging<ProtocolMap>()
