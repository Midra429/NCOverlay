import type { ContentScriptContext } from 'wxt/client'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

const vod: VodKey = 'bandaiChannel'

export default defineContentScript({
  matches: ['https://www.b-ch.com/titles/*'],
  runAt: 'document_end',
  main: (ctx) => void main(ctx),
})

const main = async (ctx: ContentScriptContext) => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const video = document.querySelector<HTMLVideoElement>(
    'video#bcplayer_html5_api'
  )

  if (!video) return

  const patcher = new NCOPatcher({
    ctx,
    getInfo: async (video) => {
      const seriesTitleElem =
        document.querySelector<HTMLElement>('#bch-series-title')
      const storyTitleElem =
        document.querySelector<HTMLElement>('#bch-story-title')
      const episodeTextElem = document.querySelector<HTMLElement>(
        '.bch-p-heading-mov__summary'
      )

      const seriesTitle = seriesTitleElem?.textContent
      const storyTitle = storyTitleElem?.firstChild?.textContent
      const episodeText = episodeTextElem?.textContent

      const title = [seriesTitle, storyTitle, episodeText].join(' ').trim()
      const duration = video?.duration ?? 0

      Logger.log('title', title)
      Logger.log('duration', duration)

      return { title, duration }
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  patcher.setVideo(video)
}
