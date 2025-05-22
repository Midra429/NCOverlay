import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { season as extractSeason } from '@midra/nco-parser/extract/lib/season'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'tver'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (nco) => {
      const seriesTitleElem = document.body.querySelector<HTMLElement>(
        'h2[class^="titles_seriesTitle"]'
      )
      const titleElem = document.body.querySelector<HTMLElement>(
        'h1[class^="titles_title"]'
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

      const seriesTitleSeason =
        seriesTitleText && extractSeason(seriesTitleText)[0]

      const workTitle =
        [
          seriesTitleText,
          !seriesTitleSeason && seasonText !== '本編' && seasonText,
        ]
          .filter(Boolean)
          .join(' ')
          .trim() || null

      const duration = nco.renderer.video.duration ?? 0

      logger.log('workTitle:', workTitle)
      logger.log('episodeTitle:', episodeTitle)
      logger.log('duration:', duration)

      return workTitle ? { workTitle, episodeTitle, duration } : null
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
          'div[class*="_videoContainer_"] .video-js > video.vjs-tech'
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
