import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'
import { DAnimeApi } from '@/content_script/api/danime'

export default async () => {
  console.log('[NCOverlay] VOD: dアニメストア')

  const video = document.querySelector<HTMLVideoElement>('#video')

  if (!video) return

  const nco = new NCOverlay(video)

  nco.onLoadedmetadata = async function () {
    this.init()

    const partId = new URL(location.href).searchParams.get('partId')

    if (!partId) return

    const partData = await DAnimeApi.part(partId)

    console.log('[NCOverlay] partData', partData)

    if (partData) {
      console.log('[NCOverlay] title', partData.title)

      await loadComments(this, {
        title: partData.title,
        duration: partData.partMeasureSecond,
        // workTitle: partData.workTitle,
        // subTitle: partData.partTitle,
      })
    }
  }

  video.insertAdjacentElement('afterend', nco.canvas)
}
