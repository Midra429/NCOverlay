import type {
  WebExtMessage,
  WebExtMessageBody,
  WebExtResponseResult,
} from '@/types/webext/message'
import webext from '@/webext'

const proxy = async <T extends keyof WebExtMessageBody>(
  type: T,
  body: WebExtMessage<T>['body']
): Promise<WebExtResponseResult[T] | null> => {
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
  search: (body: WebExtMessageBody['niconico:search']) => {
    return proxy('niconico:search', body)
  },

  video: (body: WebExtMessageBody['niconico:video']) => {
    return proxy('niconico:video', body)
  },

  threads: (body: WebExtMessageBody['niconico:threads']) => {
    return proxy('niconico:threads', body)
  },
}
