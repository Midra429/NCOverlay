import type { WebExtMessageType } from '@/types/webext/message'
import webext from '@/webext'

const proxy = async <T extends keyof WebExtMessageType>(
  type: T,
  body: WebExtMessageType[T]['body']
): Promise<WebExtMessageType[T]['result'] | null> => {
  const res = await webext.runtime.sendMessage<T>({
    type: type,
    body: body,
  })

  if (res?.result) {
    return res.result
  }

  return null
}

export const NiconicoApi = {
  search: (body: WebExtMessageType['niconico:search']['body']) => {
    return proxy('niconico:search', body)
  },

  video: (body: WebExtMessageType['niconico:video']['body']) => {
    return proxy('niconico:video', body)
  },

  threads: (body: WebExtMessageType['niconico:threads']['body']) => {
    return proxy('niconico:threads', body)
  },
}
