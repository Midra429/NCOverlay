import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { getCookie } from '@/utils/dom/getCookie'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'fod'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (nco) => {
      const id = location.pathname.replace(/\/$/, '').split('/').at(-1)
      const token = getCookie('CT')

      if (!id || !token) {
        return null
      }

      const episode = await ncoApiProxy.fod.episode(id, token)

      logger.log('fod.episode', episode)

      if (!episode) {
        return null
      }

      const workTitle = episode.lu_title
      const episodeTitle = episode.ep_title

      const duration = nco.renderer.video.duration ?? 0

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
      if (location.pathname.startsWith('/title/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          '#video_container > video[fpkey="videoPlayer"][src]'
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
