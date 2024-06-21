import type { ContentScriptContext } from 'wxt/client'
import type { VodKey } from '@/types/constants'

import { defineContentScript } from 'wxt/sandbox'
import { ncoApi } from '@midra/nco-api'

import { Logger } from '@/utils/logger'
import { checkVodEnable } from '@/utils/checkVodEnable'

import { NCOPatcher } from '@/ncoverlay/patcher'

import './style.css'

const vod: VodKey = 'dAnime'

export default defineContentScript({
  matches: ['https://animestore.docomo.ne.jp/*'],
  runAt: 'document_end',
  main: (ctx) => void main(ctx),
})

const main = async (ctx: ContentScriptContext) => {
  if (!(await checkVodEnable(vod))) return

  Logger.log(`vod-${vod}.js`)

  const video = document.querySelector<HTMLVideoElement>('video#video')

  if (video) {
    const patcher = new NCOPatcher({
      ctx,
      getInfo: async () => {
        const partId = new URL(location.href).searchParams.get('partId')
        const partData = partId ? await ncoApi.danime.part(partId) : null

        Logger.log('danime.part', partData)

        return partData
          ? {
              title: partData.title,
              duration: partData.partMeasureSecond,
            }
          : null
      },
      appendCanvas: (video, canvas) => {
        video.insertAdjacentElement('afterend', canvas)
      },
    })

    patcher.setVideo(video)
  }
}