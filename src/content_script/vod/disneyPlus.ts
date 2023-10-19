import { NCOverlay } from '@/content_script/NCOverlay'
import { NiconicoApi } from '@/content_script/api/niconico'
import { DisneyPlusApi } from '@/content_script/api/disneyPlus'
import { getVideoData } from '@/content_script/utils/getVideoData'
import { getThreads } from '@/content_script/utils/getThreads'

export default async () => {
  console.log('[NCOverlay] VOD: Disney+')

  let nco: NCOverlay | null = null

  const getInfo = async () => {
    const contentId = location.pathname.split('/').at(-1)
    const dmcVideo = contentId && (await DisneyPlusApi.dmcVideo(contentId))

    if (dmcVideo) {
      const groupNames = dmcVideo.groups.map((v) => v.name)
      const isAnime =
        groupNames.includes('Star') && groupNames.includes('Non-TWDC')

      if (isAnime) {
        const title = dmcVideo.text.title.full.season.default.content
        const episodeNo = dmcVideo.episodeSeriesSequenceNumber
        const episodeText = dmcVideo.text.title.full.program.default.content
        const workTitle = dmcVideo.text.title.full.series.default.content
        const duration = dmcVideo.mediaMetadata.runtimeMillis / 1000

        return {
          // 呪術廻戦 懐玉・玉折／渋谷事変（第2期）
          title: title,
          // 25
          episodeNo: episodeNo,
          // 懐玉
          episodeText: episodeText,
          // 呪術廻戦
          workTitle: workTitle,
          // 1437
          duration: duration,
        }
      }
    }

    return null
  }

  const modify = (video: HTMLVideoElement) => {
    console.log('[NCOverlay] modify()')

    nco = new NCOverlay(video)

    nco.onLoadedmetadata = async function () {
      const info = await getInfo()
      console.log('[NCOverlay] info', info)

      if (info) {
        const title = `${info.title} ${info.episodeNo}話 ${info.episodeText}`

        console.log('[NCOverlay] title', title)

        const searchResults = await NiconicoApi.search({
          title: title,
          duration: info.duration ?? 0,
          workTitle: info.workTitle,
          subTitle: info.episodeText,
        })

        if (searchResults) {
          const videoData = await getVideoData(
            ...searchResults.map((v) => v.contentId ?? '')
          )
          const threads = videoData && (await getThreads(...videoData))

          console.log('[NCOverlay] threads (filtered)', threads)

          if (threads) {
            this.init({
              data: videoData,
              comments: threads,
            })
          } else {
            this.init()
          }
        }
      }
    }

    video.insertAdjacentElement('afterend', nco.canvas)
  }

  const obs_config: MutationObserverInit = {
    childList: true,
    subtree: true,
  }
  const obs = new MutationObserver(() => {
    obs.disconnect()

    if (nco && !document.contains(nco.video)) {
      nco.dispose()
      nco = null
    } else if (!nco) {
      if (location.pathname.startsWith('/ja-jp/video/')) {
        const video = document.querySelector<HTMLVideoElement>(
          'video.btm-media-client-element'
        )

        if (video) {
          modify(video)
        }
      }
    }

    obs.observe(document, obs_config)
  })

  obs.observe(document, obs_config)
}
