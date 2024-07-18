import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { ncoApi } from '@midra/nco-api'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

const vod: VodKey = 'unext'

export default defineContentScript({
  matches: ['https://video.unext.jp/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async () => {
      const paths = location.pathname.split('/')
      const id = paths.at(-2)
      const episodeCode = paths.at(-1)

      if (!id || !episodeCode) {
        return null
      }

      const titleStage = await ncoApi.unext.title({
        id,
        episodeCode,
      })

      Logger.log('unext.title', titleStage)

      if (!titleStage || !titleStage.episode) {
        return null
      }

      const title = [
        titleStage.titleName,
        titleStage.episode.displayNo,
        titleStage.episode.episodeName,
      ]
        .flatMap((v) => v || [])
        .join(' ')
        .trim()

      const duration = titleStage.episode.duration

      Logger.log('title', title)
      Logger.log('duration', duration)

      return { title, duration }
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
          'div[data-ucn="fullscreenContextWrapper"] video'
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
