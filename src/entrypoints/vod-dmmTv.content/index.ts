import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'dmmTv'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

const main = async () => {
  if (!(await checkVodEnable(vod))) return

  logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (nco) => {
      const url = new URL(location.href)
      const seasonId = url.searchParams.get('season')
      const contentId = url.searchParams.get('content')

      const dataVideo =
        seasonId && contentId
          ? await ncoApiProxy.dmmTv.video({ seasonId, contentId })
          : null

      logger.log('dmmTv.video', dataVideo)

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
