import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { parse } from '@midra/nco-utils/parse'
import { normalize } from '@midra/nco-utils/parse/libs/normalize'

import { MATCHES } from '@/constants/matches'
import { formatedToSeconds } from '@/utils/format'
import { logger } from '@/utils/logger'
import { querySelectorAsync } from '@/utils/dom/querySelectorAsync'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const SEASON_NUM_REGEXP = /(?<=シーズン|Season\s)\d+/
const SEASON_NUM_VAGUE_REGEXP = /(?<=[^\d]+)[2-9]$/
const EP_NUM_REGEXP = /(?<=エピソード|Ep\.)\d+/
const SEASON_EP_REGEXP =
  /^(?:シーズン\d+、エピソード\d+|Season\s\d+,\sEp\.\d+)\s?/

const vod: VodKey = 'primeVideo'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  const patcher = new NCOPatcher(vod, {
    getInfo: async (nco) => {
      const player = nco.renderer.video.closest<HTMLElement>(
        'div[id^=dv-web-player]'
      )

      if (!player) {
        return null
      }

      const titleElem = await querySelectorAsync<HTMLElement>(
        player,
        '.atvwebplayersdk-title-text'
      )
      const subtitleElem = await querySelectorAsync<HTMLElement>(
        player,
        '.atvwebplayersdk-subtitle-text'
      )
      const timeindicatorElem = await querySelectorAsync<HTMLElement>(
        player,
        '.atvwebplayersdk-timeindicator-text:has(span)'
      )

      const title = titleElem?.textContent
      let season_episode = subtitleElem?.firstChild?.textContent
      let subtitle = subtitleElem?.lastChild?.textContent

      const seasonNum = Number(
        season_episode?.match(SEASON_NUM_REGEXP)?.[0] ?? -1
      )
      const episodeNum = Number(season_episode?.match(EP_NUM_REGEXP)?.[0] ?? -1)

      season_episode = season_episode?.replace(SEASON_EP_REGEXP, '')
      subtitle = subtitle?.replace(SEASON_EP_REGEXP, '')

      const seasonNumVague = Number(
        normalize(title ?? '').match(SEASON_NUM_VAGUE_REGEXP)?.[0] ?? -1
      )

      const parsedSubtitle = parse(`タイトル ${subtitle}`)
      const titleSeason = title && parse(`${title} #0`).season
      const subtitleEpisode =
        subtitle && parsedSubtitle.isSingleEpisode && parsedSubtitle.episode

      const seasonText =
        !titleSeason && 2 <= seasonNum && seasonNum !== seasonNumVague
          ? `${seasonNum}期`
          : null
      const workTitle =
        [title, seasonText].filter(Boolean).join(' ').trim() || null

      const episodeText =
        !subtitleEpisode && 0 <= episodeNum ? `${episodeNum}話` : null
      const episodeTitle =
        [episodeText, subtitle].filter(Boolean).join(' ').trim() || null

      const displayDuration = timeindicatorElem?.textContent
        ?.split('/')
        .map(formatedToSeconds)
        .reduce((a, b) => a + b)
      const videoDuration = nco.renderer.video.duration
      const duration = displayDuration ?? videoDuration

      logger.log('workTitle', workTitle)
      logger.log('episodeTitle', episodeTitle)
      logger.log('duration', duration)

      return workTitle
        ? {
            input: `${workTitle} ${episodeTitle ?? ''}`,
            duration,
          }
        : null
    },
    appendCanvas: (video, canvas) => {
      video
        .closest('div[id^=dv-web-player]')
        ?.querySelector(
          '.webPlayerUIContainer, .atvwebplayersdk-player-container'
        )
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

    if (patcher.nco) {
      if (!patcher.nco.renderer.video.checkVisibility()) {
        patcher.dispose()
      }
    } else {
      const video = document.body.querySelector<HTMLVideoElement>(
        'div[id^=dv-web-player].dv-player-fullscreen video[src]'
      )

      if (video) {
        patcher.setVideo(video)
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
