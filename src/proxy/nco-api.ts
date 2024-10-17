import type { ncoApi } from '@midra/nco-api'

import { defineExtensionMessaging } from '@webext-core/messaging'

type ProtocolMap = {
  'nco.ai.parse': (
    args: Parameters<typeof ncoApi.nco.ai.parse>
  ) => Awaited<ReturnType<typeof ncoApi.nco.ai.parse>>

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
  'niconico.multipleVideo': (
    args: Parameters<typeof ncoApi.niconico.multipleVideo>
  ) => Awaited<ReturnType<typeof ncoApi.niconico.multipleVideo>>
  'niconico.threads': (
    args: Parameters<typeof ncoApi.niconico.threads>
  ) => Awaited<ReturnType<typeof ncoApi.niconico.threads>>
  'niconico.multipleThreads': (
    args: Parameters<typeof ncoApi.niconico.multipleThreads>
  ) => Awaited<ReturnType<typeof ncoApi.niconico.multipleThreads>>

  'jikkyo.kakolog': (
    args: Parameters<typeof ncoApi.jikkyo.kakolog>
  ) => Awaited<ReturnType<typeof ncoApi.jikkyo.kakolog>>

  'syobocal.json': (
    args: Parameters<typeof ncoApi.syobocal.json>
  ) => Awaited<ReturnType<typeof ncoApi.syobocal.json>>
  'syobocal.db': (
    args: Parameters<typeof ncoApi.syobocal.db>
  ) => Awaited<ReturnType<typeof ncoApi.syobocal.db>>

  'danime.part': (
    args: Parameters<typeof ncoApi.danime.part>
  ) => Awaited<ReturnType<typeof ncoApi.danime.part>>

  'abema.v1.video.programs': (
    args: Parameters<typeof ncoApi.abema.v1.video.programs>
  ) => Awaited<ReturnType<typeof ncoApi.abema.v1.video.programs>>

  'abema.v1.media.slots': (
    args: Parameters<typeof ncoApi.abema.v1.media.slots>
  ) => Awaited<ReturnType<typeof ncoApi.abema.v1.media.slots>>

  'dmmTv.video': (
    args: Parameters<typeof ncoApi.dmmTv.video>
  ) => Awaited<ReturnType<typeof ncoApi.dmmTv.video>>

  'fod.episode': (
    args: Parameters<typeof ncoApi.fod.episode>
  ) => Awaited<ReturnType<typeof ncoApi.fod.episode>>

  'unext.title': (
    args: Parameters<typeof ncoApi.unext.title>
  ) => Awaited<ReturnType<typeof ncoApi.unext.title>>

  'tver.v1.callEPGv2': (
    args: Parameters<typeof ncoApi.tver.v1.callEPGv2>
  ) => Awaited<ReturnType<typeof ncoApi.tver.v1.callEPGv2>>
}

export const { onMessage, removeAllListeners, sendMessage } =
  defineExtensionMessaging<ProtocolMap>()

export const ncoApiProxy: Omit<
  typeof ncoApi,
  'setLoggerName' | 'setLoggerLevels'
> = {
  nco: {
    ai: {
      parse: (...args) => sendMessage('nco.ai.parse', args) as any,
    },
  },

  search: (...args) => sendMessage('search', args) as any,

  searchSyobocal: (...args) => sendMessage('searchSyobocal', args) as any,

  niconico: {
    search: (...args) => sendMessage('niconico.search', args) as any,
    video: (...args) => sendMessage('niconico.video', args) as any,
    multipleVideo: (...args) =>
      sendMessage('niconico.multipleVideo', args) as any,
    threads: (...args) => sendMessage('niconico.threads', args) as any,
    multipleThreads: (...args) =>
      sendMessage('niconico.multipleThreads', args) as any,
  },

  jikkyo: {
    kakolog: (...args) => sendMessage('jikkyo.kakolog', args) as any,
  },

  syobocal: {
    json: (...args) => sendMessage('syobocal.json', args) as any,
    db: (...args) => sendMessage('syobocal.db', args) as any,
  },

  danime: {
    part: (...args) => sendMessage('danime.part', args) as any,
  },

  abema: {
    v1: {
      video: {
        programs: (...args) =>
          sendMessage('abema.v1.video.programs', args) as any,
      },
      media: {
        slots: (...args) => sendMessage('abema.v1.media.slots', args) as any,
      },
    },
  },

  dmmTv: {
    video: (...args) => sendMessage('dmmTv.video', args) as any,
  },

  fod: {
    episode: (...args) => sendMessage('fod.episode', args) as any,
  },

  unext: {
    title: (...args) => sendMessage('unext.title', args) as any,
  },

  tver: {
    v1: {
      callEPGv2: (...args) => sendMessage('tver.v1.callEPGv2', args) as any,
    },
  },
}
