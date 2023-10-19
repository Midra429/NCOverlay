import { NCOverlay } from '@/content_script/NCOverlay'
import { NiconicoApi } from '@/content_script/api/niconico'
import { getVideoData } from '@/content_script/utils/getVideoData'
import { getThreads } from '@/content_script/utils/getThreads'

export default async () => {
  console.log('[NCOverlay] VOD: ABEMA')

  let nco: NCOverlay | null = null

  const getInfo = () => {
    const titleElem = document.querySelector<HTMLElement>(
      '.com-video-EpisodeTitle__series-info'
    )
    const episodeElem = document.querySelector<HTMLElement>(
      '.com-video-EpisodeTitle__episode-title'
    )

    // ['呪術廻戦', '第2期 懐玉・玉折']
    let [title, season] =
      titleElem?.textContent?.split('|').map((v) => v.trim()) ?? []

    let fullTitle = title
    if (title && season) {
      if (season.includes(title)) {
        fullTitle = season
      } else {
        fullTitle = `${title} ${season}`
      }
    }

    return {
      // 呪術廻戦 第2期 懐玉・玉折
      title: fullTitle,
      // 第25話 懐玉
      episode: episodeElem?.textContent?.trim(),
      // 呪術廻戦
      workTitle: title,
    }
  }

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    const player = video.closest<HTMLElement>('.com-vod-VODScreen__player')

    if (player) {
      nco = new NCOverlay(video)

      nco.onLoadedmetadata = async function () {
        const info = getInfo()

        console.log('[NCOverlay] info', info)

        if (info.title && info.episode) {
          const title = `${info.title} ${info.episode}`

          console.log('[NCOverlay] title', title)

          const searchResults = await NiconicoApi.search({
            title: title,
            duration: this.video.duration ?? 0,
            workTitle: info.workTitle,
            subTitle: info.episode,
          })

          if (searchResults) {
            const videoData = await getVideoData(
              ...searchResults.map((v) => v.contentId ?? '')
            )
            const threads = videoData && (await getThreads(...videoData))

            console.log('[NCOverlay] threads (filtered)', threads)

            if (threads) {
              this.init({
                data: videoData,
                comments: threads,
              })
            } else {
              this.init()
            }
          }
        }
      }

      player.appendChild(nco.canvas)
    }
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
      if (location.pathname.startsWith('/video/episode/')) {
        const video = document.querySelector<HTMLVideoElement>(
          '.com-a-Video__video > video[preload="metadata"]'
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
