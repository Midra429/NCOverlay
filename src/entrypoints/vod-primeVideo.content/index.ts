import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { parse } from '@midra/nco-utils/parse'
import { normalize } from '@midra/nco-utils/parse/libs/normalize'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { sleep } from '@/utils/sleep'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { sendMessageToPage } from '@/messaging/to-page'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'primeVideo'

const SEASON_NUM_VAGUE_REGEXP = /(?<=[^\d]+)[2-9]$/

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  const patcher = new NCOPatcher(vod, {
    getInfo: async () => {
      await sleep(2000)

      const item = await sendMessageToPage('getCurrentData', null)

      if (!item) {
        return null
      }

      const { playbackUrls, catalog } = item

      const title = catalog.seriesTitle || catalog.title
      const subtitle = catalog.seriesTitle ? catalog.title : null

      const seasonNum = catalog.seasonNumber ?? -1
      const episodeNum = catalog.episodeNumber ?? -1

      const seasonNumVague = Number(
        normalize(title).match(SEASON_NUM_VAGUE_REGEXP)?.[0] ?? -1
      )

      const parsedSubtitle = parse(`タイトル ${subtitle}`)
      const titleSeason = parse(`${title} #0`).season
      const subtitleEpisode =
        subtitle && parsedSubtitle.isSingleEpisode
          ? parsedSubtitle.episode
          : null

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

      const duration = playbackUrls.fullTitleDurationMs / 1000

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
