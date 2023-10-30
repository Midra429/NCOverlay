import type { InputFormat } from '@xpadev-net/niconicomments'
import type { search as NiconicoApiSearch } from '@/background/api/niconico/search'
import type { video as NiconicoApiVideo } from '@/background/api/niconico/video'
import type { threads as NiconicoApiThreads } from '@/background/api/niconico/threads'
import type { VideoData } from '@/types/niconico/video'

export const ChromeMessageTypeCheck = {
  /** ニコニコ 検索 */
  'niconico:search': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'niconico:search'> => msg.type === 'niconico:search',

  /** ニコニコ 動画情報 */
  'niconico:video': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'niconico:video'> => msg.type === 'niconico:video',

  /** ニコニコ コメント */
  'niconico:threads': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'niconico:threads'> =>
    msg.type === 'niconico:threads',

  /** 拡張機能 アクション 有効/無効 */
  'chrome:action': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'chrome:action'> => msg.type === 'chrome:action',

  /** 拡張機能 アクション バッジ */
  'chrome:action:badge': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'chrome:action:badge'> =>
    msg.type === 'chrome:action:badge',

  /** 拡張機能 アクション タイトル (ツールチップ) */
  'chrome:action:title': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'chrome:action:title'> =>
    msg.type === 'chrome:action:title',

  /** 拡張機能 サイドパネル 有効/無効 */
  'chrome:side_panel': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'chrome:side_panel'> =>
    msg.type === 'chrome:side_panel',

  /** ポップアップへ送信 */
  'chrome:sendToPopup': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'chrome:sendToPopup'> =>
    msg.type === 'chrome:sendToPopup',

  /** サイドパネルへ送信 */
  'chrome:sendToSidePanel': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'chrome:sendToSidePanel'> =>
    msg.type === 'chrome:sendToSidePanel',

  /** ページから取得 */
  'chrome:getFromPage': (
    msg: ChromeMessage
  ): msg is ChromeMessage<'chrome:getFromPage'> =>
    msg.type === 'chrome:getFromPage',
}

export type ChromeMessageBody = {
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

  'chrome:action': boolean
  'chrome:action:badge': string | number
  'chrome:action:title': string

  'chrome:side_panel': boolean

  'chrome:sendToPopup': {
    videoData?: VideoData[]
    commentsCount?: number
  } | null

  'chrome:sendToSidePanel': {
    commentsData?: InputFormat
    currentTime?: number
  } | null

  'chrome:getFromPage': void
}

export type ChromeMessage<T extends keyof ChromeMessageBody = any> = {
  type: T
  body: ChromeMessageBody[T]
}

export type ChromeResponseResult = {
  'niconico:search': Awaited<ReturnType<typeof NiconicoApiSearch>>
  'niconico:video': Awaited<ReturnType<typeof NiconicoApiVideo>>
  'niconico:threads': Awaited<ReturnType<typeof NiconicoApiThreads>>

  'chrome:action': boolean
  'chrome:action:badge': void
  'chrome:action:title': void

  'chrome:side_panel': void

  'chrome:sendToPopup': void

  'chrome:sendToSidePanel': void

  'chrome:getFromPage': {
    videoData?: VideoData[]
    commentsData?: InputFormat
    commentsCount?: number
    currentTime?: number
  }
}

export type ChromeResponse<T extends keyof ChromeResponseResult = any> = {
  type: T
  result: ChromeResponseResult[T]
} | void
