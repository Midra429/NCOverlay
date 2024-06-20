import type { ncoApi } from '@midra/nco-api'

import { defineExtensionMessaging } from '@webext-core/messaging'

// content -> background

type ProtocolMap = {
  'search': (
    args: Parameters<typeof ncoApi.search>
  ) => Awaited<ReturnType<typeof ncoApi.search>>

  'searchSyobocal': (
    args: Parameters<typeof ncoApi.searchSyobocal>
  ) => Awaited<ReturnType<typeof ncoApi.searchSyobocal>>

  'niconico.search': (
    args: Parameters<typeof ncoApi.niconico.search>
  ) => Awaited<ReturnType<typeof ncoApi.niconico.search>>

  'niconico.video': (
    args: Parameters<typeof ncoApi.niconico.video>
  ) => Awaited<ReturnType<typeof ncoApi.niconico.video>>

  'niconico.threads': (
    args: Parameters<typeof ncoApi.niconico.threads>
  ) => Awaited<ReturnType<typeof ncoApi.niconico.threads>>

  'syobocal.json': (
    args: Parameters<typeof ncoApi.syobocal.json>
  ) => Awaited<ReturnType<typeof ncoApi.syobocal.json>>

  'jikkyo.kakolog': (
    args: Parameters<typeof ncoApi.jikkyo.kakolog>
  ) => Awaited<ReturnType<typeof ncoApi.jikkyo.kakolog>>
}

export const ncoApiMessenger = defineExtensionMessaging<ProtocolMap>()
