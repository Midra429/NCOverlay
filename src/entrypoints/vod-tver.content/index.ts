import type { ContentScriptContext } from 'wxt/client'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

const vod: VodKey = 'tver'

export default defineContentScript({
  matches: ['https://tver.jp/*'],
  runAt: 'document_end',
  main: (ctx) => void main(ctx),
})

const main = async (ctx: ContentScriptContext) => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    ctx,
    getInfo: async (video) => {
      const seriesTitleElem = document.body.querySelector<HTMLElement>(
        'h2[class^="titles_seriesTitle"]'
      )
      const titleElem = document.body.querySelector<HTMLElement>(
        'h1[class^="titles_title"]'
      )

      const title = [
        seriesTitleElem?.textContent ?? '',
        titleElem?.textContent ?? '',
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
      if (location.pathname.startsWith('/episodes/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          'div[class^="vod-player_videoContainer"] .video-js > video.vjs-tech'
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
