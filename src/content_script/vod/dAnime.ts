import { NCOverlay } from '@/content_script/NCOverlay'
import { NiconicoApi } from '@/content_script/api/niconico'
import { DAnimeApi } from '@/content_script/api/danime'
import { getThreads } from '@/content_script/utils/getThreads'

export default async () => {
  console.log('[NCOverlay] VOD: dアニメストア')

  const video = document.querySelector<HTMLVideoElement>('#video')

  if (!video) return

  const nco = new NCOverlay(video)

  nco.onLoadedmetadata = async () => {
    await nco.init()

    const partId = new URL(location.href).searchParams.get('partId')

    if (!partId) return

    const partData = await DAnimeApi.part(partId)

    console.log('[NCOverlay] partData', partData)

    if (partData) {
      const searchResults = await NiconicoApi.search({
        title: partData.title,
        duration: partData.partMeasureSecond,
        // workTitle: partData.workTitle,
        // subtitle: partData.partTitle,
      })

      if (searchResults) {
        const threads = await getThreads(
          ...searchResults.map((v) => v.contentId ?? '')
        )

        console.log('[NCOverlay] threads (filtered)', threads)

        if (threads) {
          await nco.init(threads)
        }
      }
    }
  }

  video.insertAdjacentElement('afterend', nco.canvas)
}
