import type { InputFormat } from '@xpadev-net/niconicomments'
import type { NvCommentBody } from '@/background/api/niconico/threads'
import type { SearchData } from '@/types/niconico/search'
import type { VideoData } from '@/types/niconico/video'
import type { ThreadsData } from '@/types/niconico/threads'

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
    title: string
    duration: number
  }
  'niconico:video': {
    videoId: string
    guest?: boolean
  }
  'niconico:threads': {
    nvComment: NvCommentBody
  }

  'chrome:action': boolean
  'chrome:action:badge': string | number
  'chrome:action:title': string

  'chrome:side_panel': boolean

  'chrome:sendToPopup': {
    videoData?: VideoData[]
    commentsCount?: number
  }

  'chrome:sendToSidePanel': {
    commentsData?: InputFormat
    currentTime?: number
  }

  'chrome:getFromPage': void
}

export type ChromeMessage<T extends keyof ChromeMessageBody = any> = {
  type: T
  body: ChromeMessageBody[T]
}

export type ChromeResponseResult = {
  'niconico:search': SearchData[] | null
  'niconico:video': VideoData | null
  'niconico:threads': ThreadsData | null

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
