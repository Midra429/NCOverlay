import type { VodKey } from '@/types/constants'
import type {
  Season,
  Episode,
} from '@midra/nco-utils/types/api/netflix/metadata'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'netflix'

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
      const id = location.pathname.split('/').at(-1)

      if (!id) {
        return null
      }

      const videoData = await ncoApiProxy.netflix.metadata(id)

      logger.log('netflix.metadata', videoData)

      if (!videoData) {
        return null
      }

      let season: Season | undefined
      let episode: Episode | undefined

      if (videoData.seasons) {
        const episodeId = Number(id)

        for (const szn of videoData.seasons) {
          const ep = szn.episodes.find((ep) => ep.id === episodeId)

          if (ep) {
            season = szn
            episode = ep

            break
          }
        }

        if (!season || !episode) {
          return null
        }
      }

      const workTitle = season
        ? season.title.startsWith(videoData.title)
          ? season.title
          : `${videoData.title} ${season.title}`
        : videoData.title

      const episodeTitle = episode
        ? [`${episode.seq}話`, episode.title].join(' ')
        : null

      const duration =
        (episode?.runtime ?? videoData.runtime ?? nco.renderer.video.duration) -
        10

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
      if (location.pathname.startsWith('/watch/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          'div[data-uia="video-canvas"] video[src]'
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
