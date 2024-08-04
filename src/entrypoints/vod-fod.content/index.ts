import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { getCookie } from '@/utils/dom/getCookie'
import { getNcoApiProxy } from '@/proxy-service/NcoApiProxy'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'fod'

export default defineContentScript({
  matches: ['https://fod.fujitv.co.jp/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const ncoApiProxy = getNcoApiProxy()

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (video) => {
      const id = location.pathname.replace(/\/$/, '').split('/').at(-1)
      const token = getCookie('CT')

      if (!id || !token) {
        return null
      }

      const episode = await ncoApiProxy.fod.episode(id, token)

      Logger.log('fod.episode', episode)

      if (!episode) {
        return null
      }

      const rawText = `${episode.lu_title} ${episode.ep_title}`.trim()
      const duration = video?.duration ?? 0

      Logger.log('rawText', rawText)
      Logger.log('duration', duration)

      return { rawText, duration }
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
