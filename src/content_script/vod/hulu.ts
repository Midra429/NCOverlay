import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'

export default async () => {
  let nco: NCOverlay | null = null

  const getInfo = () => {
    const isAnime =
      document.querySelector(
        '.genre-btn > .btn-line[href="/tiles/genres/animation"]'
      ) !== null

    if (isAnime) {
      const titleElem = document.querySelector<HTMLElement>(
        '.watch-info-title > .title > a'
      )
      const episodeElem = document.querySelector<HTMLElement>(
        '.watch-info-title > .title > .ep_no'
      )
      const subTitleElem = document.querySelector(
        '.watch-info-title > .playable-title'
      )

      const title = titleElem?.textContent?.trim()
      const episodeNo = episodeElem?.lastChild?.textContent?.trim()
      const episodeText = subTitleElem?.textContent?.trim()

      return {
        // 呪術廻戦 懐玉･玉折／渋谷事変 (第2期)
        title: title,
        // 第1話
        episodeNo: episodeNo,
        // 懐玉
        episodeText: episodeText,
      }
    }

    return null
  }

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    nco = new NCOverlay(video)

    nco.onLoadedmetadata = async function () {
      this.init()

      const info = getInfo()

      console.log('[NCOverlay] info', info)

      if (info) {
        const words: string[] = []
        if (info.title) {
          words.push(info.title)
        }
        if (info.episodeNo) {
          words.push(info.episodeNo)
        }
        if (info.episodeText) {
          words.push(info.episodeText)
        }

        if (0 < words.length) {
          const title = words.join(' ')

          console.log('[NCOverlay] title', title)

          await loadComments(this, {
            title: title,
            duration: this.video.duration ?? 0,
          })
        }
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
      if (location.pathname.startsWith('/watch/')) {
        const video = document.querySelector<HTMLVideoElement>(
          '.hulu-player .video-js > video.vjs-tech'
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
