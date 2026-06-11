import type { VodKey } from '@/types/constants'
import type { VideoChapter } from '@/utils/api/jikkyo/findChapters'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { sendPageMessage } from '@/messaging/page'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'unext'

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
      const playbackInfo = await sendPageMessage(
        'page:unext:getPlaybackInfo',
        null
      )

      logger.log('getPlaybackInfo', playbackInfo)

      if (!playbackInfo) {
        return null
      }

      const { positionList } = playbackInfo

      const titleContainer = document.body.querySelector(
        'div[class*="_TitleContainer-"]'
      )
      const titleElem = titleContainer?.querySelector('h2[class*="_Title-"]')
      const subTitleElem = titleContainer?.querySelector(
        'h3[class*="_SubTitle-"]'
      )

      const workTitle = titleElem?.textContent || null
      const episodeTitle = subTitleElem?.textContent || null

      const duration = nco.renderer.video.duration ?? 0

      let chapters: VideoChapter[] = []

      if (positionList.length) {
        const opening = positionList.find((v) => v.type === 'OPENING')
        const ending = positionList.find((v) => v.type === 'ENDING')

        let avantChapter: VideoChapter | undefined
        let opChapter: VideoChapter | undefined
        let mainChapter: VideoChapter | undefined
        let edChapter: VideoChapter | undefined

        // アバン, OP
        if (opening) {
          const startMs = opening.fromSeconds * 1000
          const endMs = opening.endSeconds * 1000

          opChapter = {
            type: 'op',
            startMs,
            endMs,
            duration: endMs - startMs,
          }

          if (0 < opChapter.startMs) {
            avantChapter = {
              type: 'avant',
              startMs: 0,
              endMs: opChapter.startMs,
              duration: opChapter.startMs,
            }
          }
        }

        // ED
        if (ending) {
          const startMs = ending.fromSeconds * 1000
          const endMs = ending.endSeconds * 1000

          edChapter = {
            type: 'ed',
            startMs,
            endMs,
            duration: endMs - startMs,
          }
        }

        if (opChapter || edChapter) {
          const startMs = opChapter?.endMs ?? 0
          const endMs = edChapter?.startMs ?? duration * 1000

          mainChapter = {
            type: 'main',
            startMs,
            endMs,
            duration: endMs - startMs,
          }
        }

        chapters = [avantChapter, opChapter, mainChapter, edChapter]
          .filter((v) => v != null)
          .sort((a, b) => a.startMs - b.startMs)
      }

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
      if (location.pathname.startsWith('/play/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          ':is(#videoTagWrapper, div[data-ucn="fullscreenContextWrapper"]) video:is([src], :has(source[src]))'
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
