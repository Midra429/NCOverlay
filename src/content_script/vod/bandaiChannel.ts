import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'

export default async () => {
  console.log('[NCOverlay] VOD: バンダイチャンネル')

  const video = document.querySelector<HTMLVideoElement>(
    'video#bcplayer_html5_api'
  )

  if (!video) return

  const nco = new NCOverlay(video)

  const getInfo = () => {
    const titleElem = document.querySelector<HTMLElement>('#bch-series-title')
    const episodeElem = document.querySelector<HTMLElement>('#bch-story-title')
    const episodeTextElem = document.querySelector<HTMLElement>(
      '.bch-p-heading-mov__summary'
    )

    const title = titleElem?.textContent?.trim()
    const episodeNo = episodeElem?.firstChild?.textContent?.trim()
    const episodeText = episodeTextElem?.textContent?.trim()
    const episode = `${episodeNo ?? ''} ${episodeText ?? ''}`.trim()

    return {
      // 呪術廻戦 懐玉・玉折／渋谷事変
      title: title,
      // 第25話 懐玉
      episode: episode,
      // 呪術廻戦 懐玉・玉折／渋谷事変
      workTitle: title,
    }
  }

  nco.onLoadedmetadata = async function () {
    this.init()

    const info = getInfo()

    console.log('[NCOverlay] info', info)

    if (info.title && info.episode) {
      const title = `${info.title} ${info.episode}`

      console.log('[NCOverlay] title', title)

      await loadComments(this, {
        title: title,
        duration: this.video.duration ?? 0,
        workTitle: info.workTitle,
        subTitle: info.episode,
      })
    }
  }

  video.insertAdjacentElement('afterend', nco.canvas)
}
