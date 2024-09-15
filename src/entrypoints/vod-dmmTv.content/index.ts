import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import * as dmmTvApi from '@midra/nco-api/dmmTv'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'dmmTv'

export default defineContentScript({
  matches: ['https://tv.dmm.com/*'],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (nco) => {
      const url = new URL(location.href)
      const seasonId = url.searchParams.get('season')
      const contentId = url.searchParams.get('content')

      const dataVideo =
        seasonId && contentId
          ? await dmmTvApi.video({ seasonId, contentId })
          : null

      Logger.log('dmmTv.video:', dataVideo)

      if (!dataVideo?.categories.some((v) => v.id === '15' || v.id === '17')) {
        return null
      }

      const workTitle = dataVideo.seasonName.includes(dataVideo.titleName)
        ? dataVideo.seasonName
        : [dataVideo.titleName, dataVideo.seasonName]
            .filter(Boolean)
            .join(' ')
            .trim()

      const episodeTitle =
        [dataVideo.episode?.episodeNumberName, dataVideo.episode?.episodeTitle]
          .filter(Boolean)
          .join(' ')
          .trim() || null

      const duration =
        dataVideo.episode?.playInfo.duration ?? nco.renderer.video.duration ?? 0

      Logger.log('workTitle:', workTitle)
      Logger.log('episodeTitle:', episodeTitle)
      Logger.log('duration:', duration)

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
