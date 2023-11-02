import type { InputFormat } from '@xpadev-net/niconicomments'
import type { search as NiconicoApiSearch } from '@/background/api/niconico/search'
import type { video as NiconicoApiVideo } from '@/background/api/niconico/video'
import type { threads as NiconicoApiThreads } from '@/background/api/niconico/threads'
import type { VideoData } from '@/types/niconico/video'

export const WebExtMessageTypeCheck = {
  /** ニコニコ 検索 */
  'niconico:search': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'niconico:search'> => msg.type === 'niconico:search',

  /** ニコニコ 動画情報 */
  'niconico:video': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'niconico:video'> => msg.type === 'niconico:video',

  /** ニコニコ コメント */
  'niconico:threads': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'niconico:threads'> =>
    msg.type === 'niconico:threads',

  /** 拡張機能 アクション 有効/無効 */
  'webext:action': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'webext:action'> => msg.type === 'webext:action',

  /** 拡張機能 アクション バッジ */
  'webext:action:badge': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'webext:action:badge'> =>
    msg.type === 'webext:action:badge',

  /** 拡張機能 アクション タイトル (ツールチップ) */
  'webext:action:title': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'webext:action:title'> =>
    msg.type === 'webext:action:title',

  /** 拡張機能 サイドパネル 有効/無効 */
  'webext:side_panel': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'webext:side_panel'> =>
    msg.type === 'webext:side_panel',

  /** ポップアップへ送信 */
  'webext:sendToPopup': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'webext:sendToPopup'> =>
    msg.type === 'webext:sendToPopup',

  /** サイドパネルへ送信 */
  'webext:sendToSidePanel': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'webext:sendToSidePanel'> =>
    msg.type === 'webext:sendToSidePanel',

  /** ページから取得 */
  'webext:getFromPage': (
    msg: WebExtMessage
  ): msg is WebExtMessage<'webext:getFromPage'> =>
    msg.type === 'webext:getFromPage',
}

export type WebExtMessageBody = {
  'niconico:search': {
    query: Parameters<typeof NiconicoApiSearch>[0]
  }
  'niconico:video': {
    videoId: Parameters<typeof NiconicoApiVideo>[0]
    guest?: Parameters<typeof NiconicoApiVideo>[1]
  }
  'niconico:threads': {
    nvComment: Parameters<typeof NiconicoApiThreads>[0]
    server?: Parameters<typeof NiconicoApiThreads>[1]
  }

  'webext:action': boolean
  'webext:action:badge': string | number
  'webext:action:title': string

  'webext:side_panel': boolean

  'webext:sendToPopup': {
    videoData?: VideoData[]
    commentsCount?: number
  } | null

  'webext:sendToSidePanel': {
    commentsData?: InputFormat
    currentTime?: number
  } | null

  'webext:getFromPage': void
}

export type WebExtMessage<T extends keyof WebExtMessageBody = any> = {
  type: T
  body: WebExtMessageBody[T]
}

export type WebExtResponseResult = {
  'niconico:search': Awaited<ReturnType<typeof NiconicoApiSearch>>
  'niconico:video': Awaited<ReturnType<typeof NiconicoApiVideo>>
  'niconico:threads': Awaited<ReturnType<typeof NiconicoApiThreads>>

  'webext:action': boolean
  'webext:action:badge': void
  'webext:action:title': void

  'webext:side_panel': void

  'webext:sendToPopup': void

  'webext:sendToSidePanel': void

  'webext:getFromPage': {
    videoData?: VideoData[]
    commentsData?: InputFormat
    commentsCount?: number
    currentTime?: number
  }
}

export type WebExtResponse<T extends keyof WebExtResponseResult = any> = {
  type: T
  result: WebExtResponseResult[T]
} | void
