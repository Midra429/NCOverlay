import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { parse } from '@midra/nco-utils/parse'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'tver'

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
      const seriesTitleElem = document.body.querySelector<HTMLElement>(
        'h2[class^="EpisodeDescription_seriesTitle_"]'
      )
      const titleElem = document.body.querySelector<HTMLElement>(
        'h1[class^="EpisodeDescription_title_"]'
      )

      const seriesTitleText = seriesTitleElem?.textContent
      const episodeTitle = titleElem?.textContent ?? null

      const seasonText = [
        ...document.body.querySelectorAll(
          'div[class^="episode-live-list-column_season"] div[class^="episode-row_title"]'
        ),
      ]
        .find((v) => v.textContent === episodeTitle)
        ?.closest('div[class^="episode-live-list-column_season"]')
        ?.querySelector(
          'span[class^="episode-live-list-column_title"]'
        )?.textContent

      const { title, season } = seriesTitleText
        ? parse(
            `${seriesTitleText} ${(seasonText !== '本編' && `(${seasonText})`) || ''} #0`
          )
        : {}
      const parsed = parse(
        `${title ?? ''} ${season?.text ?? ''} ${episodeTitle}`
      )

      if (!parsed.title) {
        parsed.title = title ?? null
        parsed.titleStripped = parsed.title
      }
      if (parsed.isSingleEpisode && !parsed.episode && !parsed.subtitle) {
        const { subtitle, subtitleStripped } = parse(
          `タイトル #0 ${episodeTitle}`
        )

        parsed.subtitle = subtitle
        parsed.subtitleStripped = subtitleStripped
      }

      const duration = nco.renderer.video.duration ?? 0

      logger.log('parsed', parsed)
      logger.log('duration', duration)

      return parsed.title
        ? {
            input: parsed,
            duration,
          }
        : null
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (patcher.nco) {
      if (!patcher.nco.renderer.video.checkVisibility()) {
        patcher.dispose()
      }
    } else {
      if (location.pathname.startsWith('/episodes/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          'div[class*="_videoContainer_"] .video-js > video.vjs-tech[src]'
        )

        if (video) {
          patcher.setVideo(video)
        }
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
