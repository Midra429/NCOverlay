import type { ContentScriptContext } from 'wxt/client'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { ncoApi } from '@midra/nco-api'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

const vod: VodKey = 'dmmTv'

export default defineContentScript({
  matches: ['https://tv.dmm.com/*'],
  runAt: 'document_end',
  main: (ctx) => void main(ctx),
})

const main = async (ctx: ContentScriptContext) => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    ctx,
    getInfo: async (video) => {
      const url = new URL(location.href)
      const seasonId = url.searchParams.get('season')
      const contentId = url.searchParams.get('content')

      const dataVideo =
        seasonId && contentId
          ? await ncoApi.dmmTv.video({ seasonId, contentId })
          : null

      Logger.log('dmmTv.video', dataVideo)

      if (!dataVideo?.categories.some((v) => v.id === '15' || v.id === '17')) {
        return null
      }

      const title = [
        dataVideo.seasonName,
        dataVideo.episode?.episodeNumberName ?? '',
        dataVideo.episode?.episodeTitle ?? '',
      ]
        .join(' ')
        .trim()

      const duration =
        dataVideo.episode?.playInfo.duration ?? video?.duration ?? 0

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
      if (location.pathname.startsWith('/vod/playback/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          '#vodWrapper > div > video'
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
