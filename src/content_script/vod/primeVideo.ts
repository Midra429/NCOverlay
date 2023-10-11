import { NCOverlay } from '@/content_script/NCOverlay'
import { NiconicoApi } from '@/content_script/api/niconico'
import { getVideoData } from '@/content_script/utils/getVideoData'
import { getThreads } from '@/content_script/utils/getThreads'
// import { extractEpisodeNumber } from '@/utils/extractEpisodeNumber'

export default async () => {
  console.log('[NCOverlay] VOD: Prime Video')

  const canonicalUrl =
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ??
    null
  const asin = canonicalUrl?.match(/(?<=\/dp\/)[0-9A-Z]+$/)?.at(0) ?? null

  const rawData = document.querySelector(
    '#main > script[type="text/template"]'
  )?.textContent
  const data = rawData ? JSON.parse(rawData) : null
  const detail: { title: string } | null = asin
    ? data?.props?.state?.detail?.detail?.[asin]
    : null

  console.log('[NCOverlay] detail', detail)

  let nco: NCOverlay | null = null

  const getInfo = () => {
    const titleElem = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-title-text'
    )
    const subtitleElem = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-subtitle-text'
    )
    // const se_raw =
    //   subtitleElem?.firstChild?.textContent?.trim().replace(/\s+/g, '') ?? ''

    return {
      title: titleElem?.textContent?.trim(),
      subtitle: subtitleElem?.lastChild?.textContent?.trim(),
      // season: Number(se_raw.match(/(?<=(シーズン|season))\d+/i)?.at(0)),
      // episode: Number(se_raw.match(/(?<=(エピソード|ep\.))\d+/i)?.at(0)),
    }
  }

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    const playerUIContainer = video
      .closest<HTMLElement>('.webPlayerSDKContainer')
      ?.querySelector<HTMLElement>('.webPlayerUIContainer')

    if (playerUIContainer) {
      nco = new NCOverlay(video)

      nco.onLoadedmetadata = async function () {
        const info = getInfo()
        console.log('[NCOverlay] info', info)

        // let title = ''
        // if (
        //   info.subtitle &&
        //   !extractEpisodeNumber(info.subtitle) &&
        //   Number.isFinite(info.episode)
        // ) {
        //   title = `${detail?.title || info.title} ${info.episode}話 ${
        //     info.subtitle
        //   }`
        // } else {
        //   title = `${detail?.title || info.title} ${info.subtitle}`
        // }

        const title = `${detail?.title || info.title} ${info.subtitle}`

        console.log('[NCOverlay] title', title)

        const searchResults = await NiconicoApi.search({
          title: title,
          duration: this.video.duration ?? 0,
          workTitle: detail?.title,
          subtitle: info.subtitle,
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

      playerUIContainer.insertAdjacentElement('afterbegin', nco.canvas)
    }
  }

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (nco && !document.contains(nco.video)) {
      nco.dispose()
      nco = null
    } else if (!nco) {
      const video = document.querySelector<HTMLVideoElement>(
        '.webPlayerSDKContainer video'
      )

      if (video) {
        modify(video)
      }
    }

    obs.observe(document, obs_config)
  })

  obs.observe(document, obs_config)
}
