import type { VodKey } from '@/types/constants'
import type { VideoChapter } from '@/utils/api/jikkyo/findChapters'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'dmmTv'

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
      const url = new URL(location.href)
      const seasonId = url.searchParams.get('season')
      const contentId = url.searchParams.get('content')

      if (!seasonId || !contentId) {
        return null
      }

      const dataVideo = await ncoApiProxy.dmmTv.video({ seasonId, contentId })
      const dataStream = await ncoApiProxy.dmmTv.stream({ id: contentId })

      logger.log('dmmTv.video', dataVideo)
      logger.log('dmmTv.stream', dataStream)

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
        dataVideo.episode?.episodeTitle !== workTitle
          ? [
              dataVideo.episode?.episodeNumberName,
              dataVideo.episode?.episodeTitle,
            ]
              .filter(Boolean)
              .join(' ')
              .trim()
          : null

      const duration =
        dataVideo.episode?.playInfo.duration ?? nco.renderer.video.duration ?? 0

      const streamChapters = dataStream?.chapter

      let avantChapter: VideoChapter | undefined
      let opChapter: VideoChapter | undefined
      let mainChapter: VideoChapter | undefined
      let edChapter: VideoChapter | undefined
      // let cPartChapter: VideoChapter | undefined

      if (streamChapters) {
        if (streamChapters.op) {
          const startMs = streamChapters.op.start * 1000
          const endMs = streamChapters.op.end * 1000

          opChapter = {
            type: 'op',
            startMs,
            endMs,
          }

          if (0 < opChapter.startMs) {
            avantChapter = {
              type: 'avant',
              startMs: 0,
              endMs: opChapter.startMs,
            }
          }
        }

        if (streamChapters.ed) {
          const startMs = streamChapters.ed.start * 1000
          const endMs = streamChapters.ed.end * 1000

          edChapter = {
            type: 'ed',
            startMs,
            endMs,
          }
        }

        mainChapter = {
          type: 'main',
          startMs: opChapter?.endMs ?? 0,
          endMs: edChapter?.startMs ?? duration * 1000,
        }
      }

      const chapters = [
        avantChapter,
        opChapter,
        mainChapter,
        edChapter,
        // cPartChapter,
      ]
        .filter((v) => v != null)
        .sort((a, b) => a.startMs - b.startMs)

      logger.log('workTitle', workTitle)
      logger.log('episodeTitle', episodeTitle)
      logger.log('duration', duration)
      logger.log('chapters', chapters)

      return workTitle
        ? {
            input: `${workTitle} ${episodeTitle ?? ''}`,
            duration,
            chapters,
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
          '#vodWrapper > div > video:has(source)'
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
