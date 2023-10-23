import { NCOverlay } from '@/content_script/NCOverlay'
import { loadComments } from '@/content_script/utils/loadComments'
import { DisneyPlusApi } from '@/content_script/api/disneyPlus'

export default async () => {
  let nco: NCOverlay | null = null

  const getInfo = async () => {
    const contentId = location.pathname.split('/').at(-1)
    const dmcVideo = contentId && (await DisneyPlusApi.dmcVideo(contentId))

    console.log('[NCOverlay] DisneyPlusApi.dmcVideo', dmcVideo)

    if (dmcVideo) {
      const groupNames = dmcVideo.groups.map((v) => v.name)
      const isAnime =
        groupNames.includes('Star') && groupNames.includes('Non-TWDC')

      if (isAnime) {
        const series = dmcVideo.text.title.full.series?.default.content
        const season = dmcVideo.text.title.full.season?.default.content
        const program = dmcVideo.text.title.full.program.default.content
        const episodeNo = dmcVideo.episodeSeriesSequenceNumber
        const duration = dmcVideo.mediaMetadata.runtimeMillis / 1000

        const workTitle = series ?? season ?? program
        const title = season ?? program

        return {
          // 呪術廻戦
          workTitle: workTitle,
          // 呪術廻戦 懐玉・玉折／渋谷事変（第2期）
          title: title,
          // 25話
          episodeNo: episodeNo != null ? `${episodeNo}話` : '',
          // 懐玉
          episodeText: episodeNo != null ? program : '',
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
      this.init()

      const info = await getInfo()

      console.log('[NCOverlay] info', info)

      if (info) {
        let title = info.title
        if (info.episodeNo) {
          title += ` ${info.episodeNo}`
        }
        if (info.episodeText) {
          title += ` ${info.episodeText}`
        }

        console.log('[NCOverlay] title', title)

        await loadComments(this, {
          title: title,
          duration: info.duration ?? 0,
          workTitle: info.workTitle,
          subTitle: info.episodeText,
        })
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
