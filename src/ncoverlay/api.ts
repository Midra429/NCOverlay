import { ncoApi } from '@midra/nco-api'

import { ncoApiMessenger } from './api-messaging'

/**
 * `@midra/nco-api` (content -> background)
 */
export const ncoApiProxy: typeof ncoApi = {
  search: (...args: Parameters<typeof ncoApi.search>) => {
    return ncoApiMessenger.sendMessage('search', args)
  },

  searchSyobocal: (...args: Parameters<typeof ncoApi.searchSyobocal>) => {
    return ncoApiMessenger.sendMessage('searchSyobocal', args)
  },

  niconico: {
    search: (...args: Parameters<typeof ncoApi.niconico.search>) => {
      return ncoApiMessenger.sendMessage('niconico.search', args)
    },

    video: (...args: Parameters<typeof ncoApi.niconico.video>) => {
      return ncoApiMessenger.sendMessage('niconico.video', args)
    },

    threads: (...args: Parameters<typeof ncoApi.niconico.threads>) => {
      return ncoApiMessenger.sendMessage('niconico.threads', args)
    },

    multipleThreads(nvComments, additionals) {
      return Promise.all(
        nvComments.map((nvComment) => this.threads(nvComment, additionals))
      )
    },

    multipleVideo(contentIds, guest) {
      return Promise.all(
        contentIds.map((contentId) => this.video(contentId, guest))
      )
    },
  },

  jikkyo: {
    kakolog: (...args: Parameters<typeof ncoApi.jikkyo.kakolog>) => {
      return ncoApiMessenger.sendMessage('jikkyo.kakolog', args) as any
    },
  },

  syobocal: {
    json: (...args: Parameters<typeof ncoApi.syobocal.json>) => {
      return ncoApiMessenger.sendMessage('syobocal.json', args) as any
    },
  },

  danime: {
    part: (...args: Parameters<typeof ncoApi.danime.part>) => {
      return ncoApiMessenger.sendMessage('danime.part', args) as any
    },
  },

  abema: {
    program: (...args: Parameters<typeof ncoApi.abema.program>) => {
      return ncoApiMessenger.sendMessage('abema.program', args) as any
    },
  },

  dmmTv: {
    video: (...args: Parameters<typeof ncoApi.dmmTv.video>) => {
      return ncoApiMessenger.sendMessage('dmmTv.video', args) as any
    },
  },

  fod: {
    episode: (...args: Parameters<typeof ncoApi.fod.episode>) => {
      return ncoApiMessenger.sendMessage('fod.episode', args) as any
    },
  },

  unext: {
    title: (...args: Parameters<typeof ncoApi.unext.title>) => {
      return ncoApiMessenger.sendMessage('unext.title', args) as any
    },
  },
}
