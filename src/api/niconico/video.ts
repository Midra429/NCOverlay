import type { Video } from '@/types/niconico/video'

const API_URL = 'https://www.nicovideo.jp/api/watch/v3'
const API_URL_GUEST = 'https://www.nicovideo.jp/api/watch/v3_guest'

export const video = async (
  id: string,
  guest: boolean = false
): Promise<Video | null> => {
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

      if (res.ok) {
        const json = await res.json()
        return json
      }
    } catch (e) {
      console.error(e)
    }
  }

  return null
}
