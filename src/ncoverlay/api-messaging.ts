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

  'jikkyo.kakolog': (
    args: Parameters<typeof ncoApi.jikkyo.kakolog>
  ) => Awaited<ReturnType<typeof ncoApi.jikkyo.kakolog>>

  'syobocal.json': (
    args: Parameters<typeof ncoApi.syobocal.json>
  ) => Awaited<ReturnType<typeof ncoApi.syobocal.json>>

  'danime.part': (
    args: Parameters<typeof ncoApi.danime.part>
  ) => Awaited<ReturnType<typeof ncoApi.danime.part>>

  'abema.program': (
    args: Parameters<typeof ncoApi.abema.program>
  ) => Awaited<ReturnType<typeof ncoApi.abema.program>>

  'dmmTv.video': (
    args: Parameters<typeof ncoApi.dmmTv.video>
  ) => Awaited<ReturnType<typeof ncoApi.dmmTv.video>>

  'fod.episode': (
    args: Parameters<typeof ncoApi.fod.episode>
  ) => Awaited<ReturnType<typeof ncoApi.fod.episode>>

  'unext.title': (
    args: Parameters<typeof ncoApi.unext.title>
  ) => Awaited<ReturnType<typeof ncoApi.unext.title>>
}

export const ncoApiMessenger = defineExtensionMessaging<ProtocolMap>()
