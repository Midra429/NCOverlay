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

export const { onMessage, removeAllListeners, sendMessage } =
  defineExtensionMessaging<ProtocolMap>()

export const ncoApiProxy: typeof ncoApi = {
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
  },

  danime: {
    part: (...args) => sendMessage('danime.part', args) as any,
  },

  abema: {
    program: (...args) => sendMessage('abema.program', args) as any,
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
}
