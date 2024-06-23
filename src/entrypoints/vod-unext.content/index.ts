import type { ContentScriptContext } from 'wxt/client'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

const vod: VodKey = 'unext'

export default defineContentScript({
  matches: ['https://video.unext.jp/*'],
  runAt: 'document_end',
  main: (ctx) => void main(ctx),
})

const main = async (ctx: ContentScriptContext) => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    ctx,
    getInfo: async (video) => {
      const titleElem = document.querySelector<HTMLElement>(
        'button[data-ucn="player-header-back"] + div > h2'
      )
      const episodeElem = document.querySelector<HTMLElement>(
        'button[data-ucn="player-header-back"] + div > span'
      )

      const title = [
        titleElem?.textContent ?? '',
        episodeElem?.textContent ?? '',
      ]
        .join(' ')
        .trim()

      const duration = video?.duration ?? 0

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
