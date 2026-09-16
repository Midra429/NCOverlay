import type {
  Episode,
  Season,
} from '@midra/nco-utils/types/api/netflix/metadata'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'
import { parse } from '@midra/nco-utils/parse'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'netflix'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  const patcher = new NCOPatcher(vod, {
    getInfo: async (nco) => {
      const id = location.pathname.split('/').at(-1)

      if (!id) {
        return null
      }

      const metadata = await ncoApiProxy.netflix.metadata(id)

      logger.log('netflix.metadata', metadata)

      if (!metadata) {
        return null
      }

      let season: Season | undefined
      let episode: Episode | undefined

      if (metadata.seasons) {
        const episodeId = Number(id)

        for (const szn of metadata.seasons) {
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

      const subtitle = episode?.title || null

      const episodeNum = episode?.seq ?? -1

      const parsedSubtitle = parse(`タイトル ${subtitle}`)
      const subtitleEpisode =
        subtitle && parsedSubtitle.isSingleEpisode
          ? parsedSubtitle.episode
          : null

      const workTitle = season
        ? season.title.startsWith(metadata.title)
          ? season.title
          : `${metadata.title} ${season.title}`
        : metadata.title

      const episodeText =
        !subtitleEpisode && 0 <= episodeNum ? `第${episodeNum}話` : null
      const episodeTitle =
        [episodeText, subtitle].filter(Boolean).join(' ').trim() || null

      const duration =
        (episode?.runtime ?? metadata.runtime ?? nco.video.duration) - 10

      logger.log('workTitle', workTitle)
      logger.log('episodeTitle', episodeTitle)
      logger.log('duration', duration)

      return workTitle
        ? {
            input: `${workTitle} ${episodeTitle ?? ''}`,
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
  const obs = new MutationObserver(async () => {
    obs.disconnect()

    if (patcher.nco) {
      if (!patcher.nco.video.checkVisibility()) {
        await patcher.dispose()
      }
    } else {
      if (location.pathname.startsWith('/watch/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          'div[data-uia="video-canvas"] video[src]'
        )

        if (video) {
          await patcher.setVideo(video)
        }
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
