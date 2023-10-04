import type { NvComment } from '@/types/niconico/video'
import type { Threads } from '@/types/niconico/threads'

const API_URL = 'https://nvcomment.nicovideo.jp/v1/threads'

export type NvCommentBody = Omit<NvComment, 'server'> & {
  additionals: { when?: number }
}

export const threads = async (
  nvComment: NvCommentBody
): Promise<Threads | null> => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-client-os-type': 'others',
        'x-frontend-id': '6',
        'x-frontend-version': '0',
      },
      body: JSON.stringify(nvComment),
    })

    if (res.ok) {
      const json = await res.json()
      return json
    }
  } catch (e) {
    console.error(e)
  }

  return null
}
