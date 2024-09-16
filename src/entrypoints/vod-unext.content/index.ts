import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import * as unextApi from '@midra/nco-api/unext'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'unext'

export default defineContentScript({
  matches: ['https://video.unext.jp/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async () => {
      const paths = location.pathname.split('/')
      const id = paths.at(-2)
      const episodeCode = paths.at(-1)

      if (!id || !episodeCode) {
        return null
      }

      const titleStage = await unextApi.title({
        id,
        episodeCode,
      })

      logger.log('unext.title:', titleStage)

      if (!titleStage || !titleStage.episode) {
        return null
      }

      const workTitle = titleStage.titleName
      const episodeTitle = [
        titleStage.episode.displayNo,
        titleStage.episode.episodeName,
      ].join(' ')

      const duration = titleStage.episode.duration

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

    if (patcher.nco && !document.body.contains(patcher.nco.renderer.video)) {
      patcher.dispose()
    } else if (!patcher.nco) {
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
