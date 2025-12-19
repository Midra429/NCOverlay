import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from '#imports'

import { MATCHES } from '@/constants/matches'
import { logger } from '@/utils/logger'
import { getJikkyoKakolog } from '@/utils/api/jikkyo/getJikkyoKakolog'
import { checkVodEnable } from '@/utils/extension/checkVodEnable'
import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'
import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const GTV_ID_REGEXP = /^g\d_/
const ETV_ID_REGEXP = /^e\d_/

const vod: VodKey = 'nhkPlus'

export default defineContentScript({
  matches: MATCHES[vod],
  runAt: 'document_end',
  main: () => void main(),
})

async function main() {
  if (!(await checkVodEnable(vod))) return

  logger.log('vod', vod)

  let streamId: string | null = null
  let jkChId: JikkyoChannelId | null = null
  let starttime: number | null = null
  let endtime: number | null = null

  const patcher = new NCOPatcher(vod, {
    getInfo: async () => {
      streamId = location.pathname.split('/').at(-1) ?? null

      jkChId =
        (streamId?.match(GTV_ID_REGEXP) && 'jk1') ||
        (streamId?.match(ETV_ID_REGEXP) && 'jk2') ||
        null

      if (!streamId || !jkChId) {
        return null
      }

      const stream = await ncoApiProxy.nhkPlus.streams(streamId)

      logger.log('nhkPlus.streams', stream)

      if (!stream) {
        return null
      }

      const { program } = stream.stream_type

      starttime = new Date(program.start_time).getTime() / 1000
      endtime = new Date(program.end_time).getTime() / 1000

      const input = program.title
      const duration = endtime - starttime

      logger.log('input', input)
      logger.log('duration', duration)

      return { input, duration, disableParse: true }
    },
    autoSearch: async (nco, { input, duration, targets, jikkyoChannelIds }) => {
      if (
        !jkChId ||
        !starttime ||
        !endtime ||
        !targets.includes('jikkyo') ||
        !jikkyoChannelIds?.includes(jkChId)
      ) {
        return
      }

      const id = `${jkChId}:${starttime}-${endtime}`

      await nco.state.add('slotDetails', {
        type: 'jikkyo',
        id,
        status: 'loading',
        isAutoLoaded: true,
        info: {
          id: streamId,
          source: 'nhkPlus',
          title: typeof input === 'string' ? input : input.input,
          duration: duration,
          date: [starttime * 1000, endtime * 1000],
          count: {
            comment: 0,
          },
        },
        markers: [],
      })

      const comment = await getJikkyoKakolog({ jkChId, starttime, endtime })

      if (comment) {
        const { thread, markers, kawaiiCount } = comment

        await nco.state.update('slotDetails', ['id'], {
          id,
          status: 'ready',
          info: {
            count: {
              comment: thread.commentCount,
              kawaii: kawaiiCount,
            },
          },
          markers,
        })

        await nco.state.add('slots', {
          id,
          threads: [thread],
          isAutoLoaded: true,
        })
      } else {
        await nco.state.remove('slotDetails', { id })
      }

      logger.log('slots', await nco.state.get('slots'))
      logger.log('slotDetails', await nco.state.get('slotDetails'))
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

        streamId = null
        jkChId = null
        starttime = null
        endtime = null
      }
    } else {
      const video = document.body.querySelector<HTMLVideoElement>(
        'video.hls-player_video[src]'
      )

      if (video) {
        patcher.setVideo(video)
      }
    }

    obs.observe(document.body, obs_config)
  })

  obs.observe(document.body, obs_config)
}
