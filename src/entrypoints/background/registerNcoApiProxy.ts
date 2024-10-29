import { ncoApi } from '@midra/nco-api'
import { onMessage } from '@/proxy/nco-api'

export default () => {
  onMessage('nco.ai.parse', ({ data }) => {
    return ncoApi.nco.ai.parse(...data)
  })

  onMessage('search', ({ data }) => {
    return ncoApi.search(...data)
  })

  onMessage('searchSyobocal', ({ data }) => {
    return ncoApi.searchSyobocal(...data)
  })

  onMessage('niconico.search', ({ data }) => {
    return ncoApi.niconico.search(...data)
  })

  onMessage('niconico.video', ({ data }) => {
    return ncoApi.niconico.video(...data)
  })

  onMessage('niconico.multipleVideo', ({ data }) => {
    return ncoApi.niconico.multipleVideo(...data)
  })

  onMessage('niconico.threads', ({ data }) => {
    return ncoApi.niconico.threads(...data)
  })

  onMessage('niconico.multipleThreads', ({ data }) => {
    return ncoApi.niconico.multipleThreads(...data)
  })

  onMessage('jikkyo.kakolog', ({ data }) => {
    return ncoApi.jikkyo.kakolog(...data)
  })

  onMessage('syobocal.json', ({ data }) => {
    return ncoApi.syobocal.json(...data)
  })

  onMessage('danime.part', ({ data }) => {
    return ncoApi.danime.part(...data)
  })

  onMessage('abema.v1.video.programs', ({ data }) => {
    return ncoApi.abema.v1.video.programs(...data)
  })

  onMessage('abema.v1.media.slots', ({ data }) => {
    return ncoApi.abema.v1.media.slots(...data)
  })

  onMessage('dmmTv.video', ({ data }) => {
    return ncoApi.dmmTv.video(...data)
  })

  onMessage('fod.episode', ({ data }) => {
    return ncoApi.fod.episode(...data)
  })

  onMessage('unext.title', ({ data }) => {
    return ncoApi.unext.title(...data)
  })

  onMessage('tver.v1.callEPGv2', ({ data }) => {
    return ncoApi.tver.v1.callEPGv2(...data)
  })

  onMessage('nhkPlus.streams', ({ data }) => {
    return ncoApi.nhkPlus.streams(...data)
  })
}
