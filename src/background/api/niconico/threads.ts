import type { NvComment } from '@/types/niconico/video'
import type { Threads, ThreadsData } from '@/types/niconico/threads'

const API_URL = 'https://nvcomment.nicovideo.jp/v1/threads'

export type NvCommentBody = Omit<NvComment, 'server'> & {
  additionals: { when?: number }
}

export const threads = async (
  nvComment: NvCommentBody
): Promise<ThreadsData | null> => {
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
    const json: Threads = await res.json()

    if (res.ok) {
      return json.data
    } else {
      console.log('[NCOverlay] Error', json)
    }
  } catch (e) {
    console.log('[NCOverlay] Error', e)
  }

  return null
}
