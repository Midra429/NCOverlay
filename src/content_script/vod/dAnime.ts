import { NCOverlay } from '@/content_script/NCOverlay'
import { search as NiconicoApiSearch } from '@/content_script/api/search'
import { video as NiconicoApiVideo } from '@/content_script/api/video'
import { threads as NiconicoApiThreads } from '@/content_script/api/threads'
import { DAnimeApi } from '@/api/danime'

export default async function () {
  console.log('[NCOverlay] VOD: dアニメストア')

  const video = document.querySelector<HTMLVideoElement>('#video')

  if (!video) return

  const nco = new NCOverlay(video)

  nco.onLoadedmetadata = async () => {
    nco.init([])

    const partId = new URL(location.href).searchParams.get('partId')

    if (!partId) return

    const partData = await DAnimeApi.part(partId)

    console.log('[NCOverlay] partData', partData)

    if (partData) {
      const searchResults = await NiconicoApiSearch({
        title: partData.title,
        duration: partData.partMeasureSecond,
        workTitle: partData.workTitle,
        subtitle: partData.partTitle,
      })

      if (searchResults) {
        let niconicoVideoData = (
          await Promise.all(
            searchResults.map((v) => NiconicoApiVideo(v.contentId ?? ''))
          )
        ).filter(Boolean)

        if (niconicoVideoData.length === 0) {
          niconicoVideoData = (
            await Promise.all(
              searchResults.map((v) =>
                NiconicoApiVideo(v.contentId ?? '', true)
              )
            )
          ).filter(Boolean)
        }

        const niconicoThreads = (
          await Promise.all(
            niconicoVideoData.map((val) =>
              NiconicoApiThreads({
                additionals: {},
                params: val!.data.comment.nvComment.params,
                threadKey: val!.data.comment.nvComment.threadKey,
              })
            )
          )
        ).filter(Boolean)

        let allThreads = niconicoThreads.map((v) => v!.data.threads).flat()

        allThreads = allThreads
          .filter((v) => 0 < v.commentCount)
          .filter((val, idx, ary) => {
            return (
              idx ===
              ary.findIndex((v) => v.id === val.id && v.fork === val.fork)
            )
          })
          .filter((v) => v.fork !== 'easy')

        console.log('[NCOverlay] allThreads', allThreads)

        if (0 < allThreads.length) {
          nco.init(allThreads)
        }
      }
    }
  }

  video.insertAdjacentElement('afterend', nco.canvas)
}
