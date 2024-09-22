import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import * as niconicoApi from '@midra/nco-api/niconico'
import { DANIME_CHANNEL_ID } from '@midra/nco-api/constants'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { filterNvComment } from '@/utils/api/filterNvComment'
import { extractNgSettings } from '@/utils/api/extractNgSettings'
import { applyNgSettings } from '@/utils/api/applyNgSetting'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.scss'

const vod: VodKey = 'niconico'

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
      const contentId = location.pathname.split('/').at(-1)!
      const videoData = await niconicoApi.video(contentId)

      logger.log('niconico.video:', videoData)

      if (!videoData || !videoData.channel?.isOfficialAnime) {
        return null
      }

      const threadsData = await niconicoApi.threads(
        filterNvComment(videoData.comment)
      )

      if (!threadsData) {
        return null
      }

      nco.renderer.video
        .closest('div[data-name="inner"]')
        ?.classList.add('NCOverlay')

      nco.state.add('slots', {
        id: contentId,
        threads: applyNgSettings(
          threadsData.threads,
          extractNgSettings(videoData.comment.ng)
        ),
      })

      nco.state.add('slotDetails', {
        type:
          videoData.channel.id === `ch${DANIME_CHANNEL_ID}`
            ? 'danime'
            : 'official',
        id: contentId,
        status: 'ready',
        info: {
          id: contentId,
          title: videoData.video.title,
          duration: videoData.video.duration,
          date: new Date(videoData.video.registeredAt).getTime(),
          tags: videoData.tag.items.map((v) => v.name),
          count: {
            view: videoData.video.count.view,
            comment: videoData.video.count.comment,
          },
          thumbnail:
            videoData.video.thumbnail.largeUrl ||
            videoData.video.thumbnail.middleUrl ||
            videoData.video.thumbnail.url,
        },
      })

      const rawText = videoData.video.title
      const duration = videoData.video.duration

      logger.log('rawText:', rawText)
      logger.log('duration:', duration)

      return rawText ? { rawText, duration } : null
    },
    appendCanvas: (video, canvas) => {
      video
        .closest('div[data-name="inner"]')
        ?.querySelector('div[data-name="comment"]')
        ?.appendChild(canvas)
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
      if (location.pathname.startsWith('/watch/')) {
        const video = document.body.querySelector<HTMLVideoElement>(
          'div[data-name="content"] > video[data-name="video-content"]'
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
