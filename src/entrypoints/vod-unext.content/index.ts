import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'unext'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async () => {
      const paths = location.pathname.split('/')
      const id = paths.at(-2)
      const episodeCode = paths.at(-1)

      if (!id || !episodeCode) {
        return null
      }

      const titleStage = await ncoApiProxy.unext.title({
        id,
        episodeCode,
      })

      logger.log('unext.title', titleStage)

      if (!titleStage || !titleStage.episode) {
        return null
      }

      const workTitle = titleStage.titleName
      const episodeTitle = [
        titleStage.episode.displayNo,
        titleStage.episode.episodeName,
      ].join(' ')

      const duration = titleStage.episode.duration

      logger.log('workTitle', workTitle)
      logger.log('episodeTitle', episodeTitle)
      logger.log('duration', duration)

      return workTitle
        ? {
            input: `${workTitle} ${episodeTitle}`,
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
          ':is(#videoTagWrapper, div[data-ucn="fullscreenContextWrapper"]) video'
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
