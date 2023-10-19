import { NCOverlay } from '@/content_script/NCOverlay'
import { NiconicoApi } from '@/content_script/api/niconico'
import { getVideoData } from '@/content_script/utils/getVideoData'
import { getThreads } from '@/content_script/utils/getThreads'
// import { extractEpisodeNumber } from '@/utils/extractEpisodeNumber'

export default async () => {
  console.log('[NCOverlay] VOD: Prime Video')

  let nco: NCOverlay | null = null

  const getDetail = (): { title: string } | null => {
    const canonicalUrl =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ??
      null
    const asin = canonicalUrl?.match(/(?<=\/dp\/)[0-9A-Z]+$/)?.at(0) ?? null

    const rawData = document.querySelector(
      '#main > script[type="text/template"]'
    )?.textContent
    const data = JSON.parse(rawData ?? '{}')

    return asin ? data.props?.state?.detail?.detail?.[asin] : null
  }

  const getInfo = () => {
    const detail = getDetail()

    console.log('[NCOverlay] detail', detail)

    const titleElem = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-title-text'
    )
    const subtitleElem = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-subtitle-text'
    )
    // const se_raw =
    //   subtitleElem?.firstChild?.textContent?.trim().replace(/\s+/g, '') ?? ''

    return {
      // 呪術廻戦 懐玉・玉折／渋谷事変 || 呪術廻戦
      title: detail?.title || titleElem?.textContent?.trim(),
      // 第25話 懐玉
      episode: subtitleElem?.lastChild?.textContent?.trim(),
      // 呪術廻戦
      workTitle: detail?.title,
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
