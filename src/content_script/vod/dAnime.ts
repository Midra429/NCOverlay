import webext from '@/webext'
import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'
import { injectScript } from '@/content_script/utils/injectScript'
import { DAnimeApi } from '@/content_script/api/danime'

export default async () => {
  injectScript(webext.runtime.getURL('plugins/dAnime.js'))

  const video = document.querySelector<HTMLVideoElement>('video#video')

  if (!video) return

  const nco = new NCOverlay(video)

  nco.onLoadedmetadata = async function () {
    this.init()

    const partId = new URL(location.href).searchParams.get('partId')

    if (!partId) return

    const partData = await DAnimeApi.part(partId)

    console.log('[NCOverlay] DAnimeApi.part', partData)

    if (partData) {
      console.log('[NCOverlay] title', partData.title)

      await loadComments(this, {
        title: partData.title,
        duration: partData.partMeasureSecond,
      })
    }
  }

  video.insertAdjacentElement('afterend', nco.canvas)
}
