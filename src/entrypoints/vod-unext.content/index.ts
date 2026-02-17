import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'unext'

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
      const titleContainer = document.body.querySelector(
        'div[class*="_TitleContainer-"]'
      )
      const titleElem = titleContainer?.querySelector('h2[class*="_Title-"]')
      const subTitleElem = titleContainer?.querySelector(
        'h3[class*="_SubTitle-"]'
      )

      const workTitle = titleElem?.textContent || null
      const episodeTitle = subTitleElem?.textContent || null

      const duration = nco.renderer.video.duration ?? 0

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
      if (location.pathname.startsWith('/play/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          ':is(#videoTagWrapper, div[data-ucn="fullscreenContextWrapper"]) video[src]'
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
