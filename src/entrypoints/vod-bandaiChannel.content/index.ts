import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'bandaiChannel'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  const video = document.body.querySelector<HTMLVideoElement>(
    'video#bcplayer_html5_api'
  )

  if (!video) return

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (nco) => {
      const seriesTitleElem =
        document.body.querySelector<HTMLElement>('#bch-series-title')
      const storyTitleElem =
        document.body.querySelector<HTMLElement>('#bch-story-title')
      const episodeTextElem = document.body.querySelector<HTMLElement>(
        '.bch-p-heading-mov__summary'
      )

      const workTitle = seriesTitleElem?.textContent || null
      const episodeTitle =
        [storyTitleElem?.firstChild?.textContent, episodeTextElem?.textContent]
          .filter(Boolean)
          .join(' ')
          .trim() || null

      const duration = nco.renderer.video.duration ?? 0

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

  patcher.setVideo(video)
}
