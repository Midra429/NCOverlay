import type { ContentScriptContext } from 'wxt/client'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { season as extractSeason } from '@midra/nco-parser/extract/lib/season'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

const vod: VodKey = 'tver'

export default defineContentScript({
  matches: ['https://tver.jp/*'],
  runAt: 'document_end',
  main: (ctx) => void main(ctx),
})

const main = async (ctx: ContentScriptContext) => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const patcher = new NCOPatcher({
    ctx,
    getInfo: async (video) => {
      const seriesTitleElem = document.body.querySelector<HTMLElement>(
        'h2[class^="titles_seriesTitle"]'
      )
      const titleElem = document.body.querySelector<HTMLElement>(
        'h1[class^="titles_title"]'
      )

      const seriesTitleText = seriesTitleElem?.textContent
      const titleText = titleElem?.textContent

      const seasonText = [
        ...document.body.querySelectorAll(
          'div[class^="episode-live-list-column_season"] div[class^="episode-row_title"]'
        ),
      ]
        .find((v) => v.textContent === titleText)
        ?.closest('div[class^="episode-live-list-column_season"]')
        ?.querySelector(
          'span[class^="episode-live-list-column_title"]'
        )?.textContent

      const seriesTitleSeason =
        seriesTitleText && extractSeason(seriesTitleText)[0]

      const title = [
        seriesTitleText,
        !seriesTitleSeason && seasonText !== '本編' && seasonText,
        titleText,
      ]
        .flatMap((v) => v || [])
        .join(' ')
        .trim()

      const duration = video?.duration ?? 0

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
      if (location.pathname.startsWith('/episodes/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          'div[class^="vod-player_videoContainer"] .video-js > video.vjs-tech'
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
