import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'

export default async () => {
  let nco: NCOverlay | null = null

  const getInfo = () => {
    const titleElem = document.querySelector<HTMLElement>(
      'h2[class^="titles_seriesTitle"]'
    )
    const episodeElem = document.querySelector<HTMLElement>(
      'h1[class^="titles_title"]'
    )

    const title = titleElem?.textContent?.trim()

    return {
      // 呪術廻戦 懐玉・玉折／渋谷事変
      title: title,
      // 第25話「懐玉」
      episode: episodeElem?.textContent?.trim(),
    }
  }

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    nco = new NCOverlay(video)

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
          workTitle: info.title,
          subTitle: info.episode,
        })
      }
    }

    video.insertAdjacentElement('afterend', nco.canvas)
  }

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (nco && !document.contains(nco.video)) {
      nco.dispose()
      nco = null
    } else if (!nco) {
      if (location.pathname.startsWith('/episodes/')) {
        const video = document.querySelector<HTMLVideoElement>(
          'div[class^="vod-player_videoContainer"] .video-js > video.vjs-tech'
        )

        if (video) {
          modify(video)
        }
      }
    }

    obs.observe(document, obs_config)
  })

  obs.observe(document, obs_config)
}
