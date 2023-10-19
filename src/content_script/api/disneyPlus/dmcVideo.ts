import type { DmcVideo, Video } from '@/types/disneyPlus/dmcVideo'

const API_URL =
  'https://disney.content.edge.bamgrid.com/svc/' +
  [
    'content/DmcVideo',
    'version/5.1',
    'region/JP',
    'audience/k-false,l-true',
    'maturity/1850',
    'language/ja',
    'contentId',
  ].join('/')

export const dmcVideo = async (contentId: string): Promise<Video | null> => {
  try {
    const res = await fetch(`${API_URL}/${contentId}`)

    if (res.ok) {
      const json: DmcVideo = await res.json()

      if (json.data.DmcVideo.video) {
        return json.data.DmcVideo.video
      }
    }
  } catch (e) {
    console.error('[NCOverlay] Error', e)
  }

  return null
}
