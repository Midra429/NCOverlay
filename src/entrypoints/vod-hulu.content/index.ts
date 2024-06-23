import type { ContentScriptContext } from 'wxt/client'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'hulu'

export default defineContentScript({
  matches: ['https://www.hulu.jp/*'],
  runAt: 'document_end',
  main: (ctx) => void main(ctx),
})

const main = async (ctx: ContentScriptContext) => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    ctx,
    getInfo: async (video) => {
      if (
        document.querySelector(
          '.genre-btn > .btn-line[href="/tiles/genres/animation"]'
        ) === null
      ) {
        return null
      }

      const titleElem = document.querySelector<HTMLElement>(
        '.watch-info-title > .title > a'
      )
      const episodeElem = document.querySelector<HTMLElement>(
        '.watch-info-title > .title > .ep_no'
      )
      const subTitleElem = document.querySelector(
        '.watch-info-title > .playable-title'
      )

      const title = [
        titleElem?.textContent ?? '',
        episodeElem?.textContent ?? '',
        subTitleElem?.textContent ?? '',
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
      if (location.pathname.startsWith('/watch/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          '.hulu-player .video-js:not(.vjs-waiting) > video.vjs-tech[src]'
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
