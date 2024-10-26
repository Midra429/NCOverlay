import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'

import { MATCHES } from '@/constants/matches'

import { logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { getNiconicoComments } from '@/utils/api/getNiconicoComments'
import { videoDataToSlotDetail } from '@/utils/api/videoDataToSlotDetail'
import { ncoApiProxy } from '@/proxy/nco-api'

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

  let onChangeRemoveListener: (() => void) | null = null

  const patcher = new NCOPatcher({
    vod,
    getInfo: async (nco) => {
      const wrapper = nco.renderer.video.closest('div[data-name="inner"]')

      wrapper?.classList.remove('NCOverlay')

      onChangeRemoveListener?.()
      onChangeRemoveListener = nco.state.onChange(
        'slotDetails',
        (newDetail, oldDetail) => {
          if (!oldDetail?.length && newDetail?.length) {
            wrapper?.classList.add('NCOverlay')
          } else if (oldDetail?.length && !newDetail?.length) {
            wrapper?.classList.remove('NCOverlay')
          }
        }
      )

      const id = location.pathname.split('/').at(-1)!
      const videoData = await ncoApiProxy.niconico.video(id)

      logger.log('niconico.video:', videoData)

      if (!videoData?.channel?.isOfficialAnime) {
        return null
      }

      await nco.state.add(
        'slotDetails',
        videoDataToSlotDetail(videoData, {
          id,
          status: 'loading',
          isAutoLoaded: true,
        })
      )

      const [comment] = await getNiconicoComments([videoData])

      if (comment) {
        const { data, threads, kawaiiCount } = comment

        await nco.state.update('slotDetails', ['id'], {
          id,
          status: 'ready',
          info: {
            count: {
              kawaii: kawaiiCount,
            },
          },
        })

        await nco.state.add('slots', { id, threads })

        const rawText = data.video.title
        const duration = data.video.duration

        logger.log('rawText:', rawText)
        logger.log('duration:', duration)

        return { rawText, duration }
      } else {
        await nco.state.remove('slotDetails', { id })
      }

      return null
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
