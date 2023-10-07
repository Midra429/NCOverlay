import type { Video, VideoData } from '@/types/niconico/video'

const API_URL = 'https://www.nicovideo.jp/api/watch/v3'
const API_URL_GUEST = 'https://www.nicovideo.jp/api/watch/v3_guest'

export const video = async (
  id: string,
  guest: boolean = false
): Promise<VideoData | null> => {
  if (/^[a-z]+\d+$/.test(id)) {
    try {
      const params = {
        _frontendId: '6',
        _frontendVersion: '0',
        actionTrackId: `${[...Array(10)]
          .map(
            () =>
              'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[
                Math.floor(Math.random() * 62)
              ]
          )
          .join('')}_${Date.now()}`,
        t: Date.now().toString(),
      }

      const url = `${
        guest ? API_URL_GUEST : API_URL
      }/${id}?${new URLSearchParams(params)}`
      const res = await fetch(url, {
        method: 'GET',
      })
      const json: Video = await res.json()

      if (res.ok) {
        return json.data
      } else {
        console.log('[NCOverlay] Error', json)
      }
    } catch (e) {
      console.log('[NCOverlay] Error', e)
    }
  }

  return null
}
