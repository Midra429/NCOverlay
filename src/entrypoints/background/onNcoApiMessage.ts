import { ncoApi } from '@midra/nco-api'

import { ncoApiMessenger } from '@/ncoverlay/api-messaging'

export default () => {
  ncoApiMessenger.onMessage('search', ({ data }) => {
    return ncoApi.search(...data)
  })

  ncoApiMessenger.onMessage('searchSyobocal', ({ data }) => {
    return ncoApi.searchSyobocal(...data)
  })

  ncoApiMessenger.onMessage('niconico.search', ({ data }) => {
    return ncoApi.niconico.search(...data)
  })

  ncoApiMessenger.onMessage('niconico.video', ({ data }) => {
    return ncoApi.niconico.video(...data)
  })

  ncoApiMessenger.onMessage('niconico.threads', ({ data }) => {
    return ncoApi.niconico.threads(...data)
  })

  ncoApiMessenger.onMessage('jikkyo.kakolog', ({ data }) => {
    return ncoApi.jikkyo.kakolog(...data)
  })

  ncoApiMessenger.onMessage('syobocal.json', ({ data }) => {
    return ncoApi.syobocal.json(...data)
  })

  ncoApiMessenger.onMessage('danime.part', ({ data }) => {
    return ncoApi.danime.part(...data)
  })

  ncoApiMessenger.onMessage('abema.program', ({ data }) => {
    return ncoApi.abema.program(...data)
  })

  ncoApiMessenger.onMessage('dmmTv.video', ({ data }) => {
    return ncoApi.dmmTv.video(...data)
  })

  ncoApiMessenger.onMessage('fod.episode', ({ data }) => {
    return ncoApi.fod.episode(...data)
  })

  ncoApiMessenger.onMessage('unext.title', ({ data }) => {
    return ncoApi.unext.title(...data)
  })
}
