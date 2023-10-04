import { NCOverlay } from '@/content_script/NCOverlay'
import { search as NiconicoApiSearch } from '@/content_script/api/search'
import { video as NiconicoApiVideo } from '@/content_script/api/video'
import { threads as NiconicoApiThreads } from '@/content_script/api/threads'
import { extractEpisodeNumber } from '@/utils/extractEpisodeNumber'

export default async function () {
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

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    if (nco) {
      nco.dispose()
      nco = null
    }

    const playerUIContainer = video
      .closest<HTMLElement>('.webPlayerSDKContainer')
      ?.querySelector<HTMLElement>('.webPlayerUIContainer')

    if (playerUIContainer) {
      nco = new NCOverlay(video)

      nco.onLoadedmetadata = async () => {
        const info = getInfo()
        console.log('[NCOverlay] getInfo()', info)

        let title = ''
        if (!extractEpisodeNumber(info.subtitle) && 0 <= info.episode) {
          title = `${detail?.title || info.title} ${info.episode}話 ${
            info.subtitle
          }`
        } else {
          title = `${detail?.title || info.title} ${info.subtitle}`
        }

        console.log(`[NCOverlay] title: ${title}`)

        const searchResults = await NiconicoApiSearch({
          title: title,
          duration: info.duration,
          workTitle: info.workTitle,
          subtitle: info.subtitle,
        })

        if (searchResults) {
          let niconicoVideoData = (
            await Promise.all(
              searchResults.map((v) => NiconicoApiVideo(v.contentId ?? ''))
            )
          ).filter(Boolean)

          if (niconicoVideoData.length === 0) {
            niconicoVideoData = (
              await Promise.all(
                searchResults.map((v) =>
                  NiconicoApiVideo(v.contentId ?? '', true)
                )
              )
            ).filter(Boolean)
          }

          const niconicoThreads = (
            await Promise.all(
              niconicoVideoData.map((val) =>
                NiconicoApiThreads({
                  additionals: {},
                  params: val!.data.comment.nvComment.params,
                  threadKey: val!.data.comment.nvComment.threadKey,
                })
              )
            )
          ).filter(Boolean)

          let allThreads = niconicoThreads.map((v) => v!.data.threads).flat()

          allThreads = allThreads
            .filter((v) => 0 < v.commentCount)
            .filter((val, idx, ary) => {
              return (
                idx ===
                ary.findIndex((v) => v.id === val.id && v.fork === val.fork)
              )
            })
            .filter((v) => v.fork !== 'easy')

          console.log('[NCOverlay] allThreads', allThreads)

          if (0 < allThreads.length) {
            nco?.init(allThreads)
          } else {
            nco?.dispose()
            nco = null
          }
        }
      }

      playerUIContainer.insertAdjacentElement('afterbegin', nco.canvas)
    }
  }

  const getInfo = () => {
    const title = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-title-text'
    )
    const subtitle = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-subtitle-text'
    )
    const se_raw =
      subtitle?.firstChild?.textContent?.trim().replace(/\s+/g, '') ?? ''

    return {
      workTitle: detail?.title ?? '',
      title: title?.textContent?.trim() ?? '',
      subtitle: subtitle?.lastChild?.textContent?.trim() ?? '',
      season: Number(se_raw.match(/(?<=(シーズン|season))\d+/i)?.at(0) ?? -1),
      episode: Number(se_raw.match(/(?<=(エピソード|ep\.))\d+/i)?.at(0) ?? -1),
      duration: nco?.video.duration ?? 0,
    }
  }

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  }
  const obs = new MutationObserver((mutations) => {
    obs.disconnect()

    for (const mutation of mutations) {
      if (!(mutation.target instanceof HTMLElement)) continue

      if (
        mutation.type === 'childList' &&
        0 < mutation.addedNodes.length &&
        mutation.target.classList.contains('rendererContainer')
      ) {
        const video = mutation.target.getElementsByTagName('video')[0]
        if (video?.src) {
          modify(video)
        }
      }

      if (
        mutation.type === 'attributes' &&
        mutation.target instanceof HTMLVideoElement &&
        mutation.target.matches('.webPlayerSDKContainer video')
      ) {
        if (!nco && mutation.target.src) {
          modify(mutation.target)
        } else if (nco) {
          nco.dispose()
          nco = null
        }
      }
    }

    obs.observe(document.body, obs_config)
  })
  obs.observe(document.body, obs_config)
}
