import type { search as NiconicoApiSearch } from '@/background/api/niconico/search'
import type { video as NiconicoApiVideo } from '@/background/api/niconico/video'
import type { threads as NiconicoApiThreads } from '@/background/api/niconico/threads'
import type { InitData } from '@/content_script/NCOverlay'

export type WebExtMessageType = {
  'niconico:search': {
    body: Parameters<typeof NiconicoApiSearch>
    result: Awaited<ReturnType<typeof NiconicoApiSearch>>
  }
  'niconico:video': {
    body: Parameters<typeof NiconicoApiVideo>
    result: Awaited<ReturnType<typeof NiconicoApiVideo>>
  }
  'niconico:threads': {
    body: Parameters<typeof NiconicoApiThreads>
    result: Awaited<ReturnType<typeof NiconicoApiThreads>>
  }

  'webext:action': {
    body: boolean
    result: void
  }
  'webext:action:badge': {
    body: string | number
    result: void
  }
  'webext:action:title': {
    body: string
    result: void
  }

  'webext:side_panel': {
    body: boolean
    result: void
  }

  'webext:sendToPopup': {
    body: {
      initData?: InitData[]
      commentsCount?: number
    } | null
    result: void
  }

  'webext:sendToSidePanel': {
    body: {
      initData?: InitData[]
      currentTime?: number
    } | null
    result: void
  }

  'webext:getFromPage': {
    body: void
    result: {
      initData?: InitData[]
      commentsCount?: number
      currentTime?: number
    }
  }
}

export const WebExtMessageTypeCheck = <T extends keyof WebExtMessageType>(
  type: T,
  msg: WebExtMessage
): msg is WebExtMessage<T> => msg.type === type

export type WebExtMessage<T extends keyof WebExtMessageType = any> = {
  type: T
  body: WebExtMessageType[T]['body']
}

export type WebExtMessageResponse<T extends keyof WebExtMessageType = any> = {
  type: T
  result: WebExtMessageType[T]['result']
}
