import type { NvComment } from '@/types/niconico/video'
import type { Threads, ThreadsData } from '@/types/niconico/threads'
import { NICONICO_THREADS_API } from '@/constants'

export type NvCommentBody = Omit<NvComment, 'server'> & {
  additionals: { when?: number }
}

export const threads = async (
  nvComment: NvCommentBody,
  server?: string
): Promise<ThreadsData | null> => {
  try {
    const res = await fetch(
      server ? `${server}/v1/threads` : NICONICO_THREADS_API,
      {
        method: 'POST',
        headers: {
          'X-Frontend-Id': '6',
          'X-Frontend-Version': '0',
          'X-Client-Os-Type': 'others',
        },
        body: JSON.stringify(nvComment),
      }
    )
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
