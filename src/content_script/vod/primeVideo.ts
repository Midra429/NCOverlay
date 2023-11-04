import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'
import { isVisible } from '@/utils/dom'
import { querySelectorAsync } from '@/utils/dom/querySelectorAsync'
import { formatedToSeconds } from '@/utils/formatedToSeconds'

export default async () => {
  let nco: NCOverlay | null = null

  const getDetail = (): { title: string } | null => {
    const canonicalUrl = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    )?.href

    const asin = canonicalUrl?.match(/(?<=\/dp\/)[0-9A-Z]+$/)?.[0] ?? ''
    const titleID =
      document.querySelector<HTMLInputElement>(
        '.dv-dp-node-watchlist input[name="titleID"]'
      )?.value ?? ''

    const data = JSON.parse(
      document.querySelector('#main > script[type="text/template"]')
        ?.textContent || '{}'
    )

    return (
      data.props?.state?.detail?.detail?.[asin] ??
      data.props?.state?.detail?.detail?.[titleID] ??
      null
    )
  }

  const getInfo = async () => {
    const detail = getDetail()

    console.log('[NCOverlay] detail', detail)

    const titleElem = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-title-text'
    )
    const subtitleElem = document.querySelector<HTMLElement>(
      '.atvwebplayersdk-subtitle-text'
    )
    const timeindicatorElem = await querySelectorAsync<HTMLElement>(
      '.atvwebplayersdk-timeindicator-text:has(span)'
    )
    // const se_raw =
    //   subtitleElem?.firstChild?.textContent?.trim().replace(/\s+/g, '') ?? ''

    const episodeText = subtitleElem?.lastChild?.textContent?.trim()

    // const seasonNum = Number(se_raw.match(/(?<=シーズン|season)\d+/i)?.[0])
    // const episodeNum = Number(se_raw.match(/(?<=エピソード|ep\.)\d+/i)?.[0])

    const duration = (timeindicatorElem?.textContent?.split('/') ?? [])
      .map(formatedToSeconds)
      .reduce((sum, val) => sum + val, 0)

    return {
      // 呪術廻戦 懐玉・玉折／渋谷事変 || 呪術廻戦
      title: detail?.title || titleElem?.textContent?.trim(),
      // 第25話 懐玉
      episode: episodeText,
      // episode:
      //   !new RegExp(REGEXP_EPISODE).test(normalizer.all(episodeText ?? '')) &&
      //   Number.isFinite(episodeNum)
      //     ? `${episodeNum}話 ${episodeText}`
      //     : episodeText,
      // 1435
      duration: duration,
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
        this.init()

        const info = await getInfo()

        console.log('[NCOverlay] info', info)

        if (info.title) {
          let title = info.title
          if (info.episode) {
            title += ` ${info.episode}`
          }

          console.log('[NCOverlay] title', title)

          await loadComments(this, {
            title: title,
            duration: info.duration,
          })
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

    if (nco && (!document.contains(nco.video) || !isVisible(nco.video))) {
      nco.dispose()
      nco = null
    } else if (!nco) {
      const video = document.querySelector<HTMLVideoElement>(
        '.webPlayerSDKContainer video'
      )

      if (isVisible(video)) {
        modify(video)
      }
    }

    obs.observe(document, obs_config)
  })

  obs.observe(document, obs_config)
}
