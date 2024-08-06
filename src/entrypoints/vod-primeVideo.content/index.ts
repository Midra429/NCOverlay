import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { normalizeAll } from '@midra/nco-parser/normalize'
import { season as extractSeason } from '@midra/nco-parser/extract/lib/season'
import { episode as extractEpisode } from '@midra/nco-parser/extract/lib/episode'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { querySelectorAsync } from '@/utils/dom/querySelectorAsync'

import { NCOPatcher } from '@/ncoverlay/patcher'
import { formatedToSeconds } from '@/utils/format'

import './style.scss'

const vod: VodKey = 'primeVideo'

export default defineContentScript({
  matches: ['https://www.amazon.co.jp/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const getDetail = (): { title: string } | null => {
  const canonicalUrl = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  )?.href
  const asin = canonicalUrl?.match(/(?<=\/dp\/)[0-9A-Z]+$/)?.[0] ?? ''
  const titleId1 =
    location.href?.match(/(?<=\/dp\/)[0-9A-Z]+(?=\/|$)/)?.[0] ?? ''
  const titleId2 =
    document.querySelector<HTMLInputElement>(
      '.dv-dp-node-watchlist input[name="titleID"]'
    )?.value ?? ''

  const data = JSON.parse(
    document.querySelector('#a-page > script[type="text/template"]')
      ?.textContent || '{}'
  )

  try {
    const { props } = data.props.body[0]

    if ('atf' in props) {
      const { headerDetail } = props.atf.state.detail
      const detail =
        headerDetail[asin] || headerDetail[titleId1] || headerDetail[titleId2]

      if (detail?.title) {
        return detail
      }
    }

    if ('landingPage' in props) {
      const detail = props.landingPage.containers
        // @ts-ignore
        .flatMap((v) => v.entities)
        // @ts-ignore
        .find((v) => {
          return (
            v.titleID === asin ||
            v.titleID === titleId1 ||
            v.titleID === titleId2
          )
        })

      if (detail?.title) {
        return detail
      }
    }
  } catch {}

  return null
}

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (video) => {
      const player = video?.closest<HTMLElement>('.webPlayerSDKContainer')

      if (!player) {
        return null
      }

      const titleElem = player.querySelector<HTMLElement>(
        '.atvwebplayersdk-title-text'
      )
      const subtitleElem = player.querySelector<HTMLElement>(
        '.atvwebplayersdk-subtitle-text'
      )
      const timeindicatorElem = await querySelectorAsync(
        player,
        '.atvwebplayersdk-timeindicator-text:has(span)'
      )

      const detail = getDetail()

      Logger.log('detail', detail)

      const workTitle = detail?.title || titleElem?.textContent
      const season_episode = subtitleElem?.firstChild?.textContent
      const subtitle = subtitleElem?.lastChild?.textContent

      const seasonNum = Number(
        season_episode?.match(/(?<=シーズン|Season)\d+/)?.[0] ?? -1
      )
      const episodeNum = Number(
        season_episode?.match(/(?<=エピソード|Ep\.)\d+/)?.[0] ?? -1
      )

      const workTitleSeason = workTitle && extractSeason(workTitle)[0]
      const subtitleEpisode =
        subtitle &&
        extractEpisode(
          normalizeAll(`タイトル ${subtitle}`, {
            remove: {
              space: false,
            },
          })
        )[0]

      const rawText = [
        workTitle,
        !workTitleSeason && 2 <= seasonNum && `${seasonNum}期`,
        !subtitleEpisode && 0 <= episodeNum && `${episodeNum}話`,
        subtitle,
      ]
        .flatMap((v) => v || [])
        .join(' ')
        .trim()

      const duration =
        timeindicatorElem?.textContent
          ?.split('/')
          .map(formatedToSeconds)
          .reduce((a, b) => a + b) ?? 0

      Logger.log('rawText', rawText)
      Logger.log('duration', duration)

      return { rawText, duration }
    },
    appendCanvas: (video, canvas) => {
      video
        .closest('.webPlayerSDKContainer')
        ?.querySelector('.webPlayerUIContainer')
        ?.insertAdjacentElement('afterbegin', canvas)
    },
  })

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (
      patcher.nco &&
      !(
        document.body.contains(patcher.nco.renderer.video) &&
        patcher.nco.renderer.video.offsetParent
      )
    ) {
      patcher.dispose()
    } else if (!patcher.nco) {
      const video = document.body.querySelector<HTMLVideoElement>(
        '.webPlayerSDKContainer video[src]'
      )

      if (video?.offsetParent) {
        patcher.setVideo(video)
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
