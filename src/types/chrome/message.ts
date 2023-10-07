import type { NvCommentBody } from '@/background/api/niconico/threads'
import type { SearchData } from '@/types/niconico/search'
import type { VideoData } from '@/types/niconico/video'
import type { ThreadsData } from '@/types/niconico/threads'

export const isChromeMessageSearch = (
  msg: ChromeMessage
): msg is ChromeMessage<'niconico:search'> => msg.type === 'niconico:search'

export const isChromeMessageVideo = (
  msg: ChromeMessage
): msg is ChromeMessage<'niconico:video'> => msg.type === 'niconico:video'

export const isChromeMessageThreads = (
  msg: ChromeMessage
): msg is ChromeMessage<'niconico:threads'> => msg.type === 'niconico:threads'

export const isChromeMessageBadge = (
  msg: ChromeMessage
): msg is ChromeMessage<'chrome:badge'> => msg.type === 'chrome:badge'

export const isChromeMessageSendToPopup = (
  msg: ChromeMessage
): msg is ChromeMessage<'chrome:sendToPopup'> =>
  msg.type === 'chrome:sendToPopup'

export const isChromeMessageGetFromPage = (
  msg: ChromeMessage
): msg is ChromeMessage<'chrome:getFromPage'> =>
  msg.type === 'chrome:getFromPage'

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

  'chrome:badge': string | number
  'chrome:sendToPopup': {
    videoData?: VideoData[]
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

  'chrome:badge': void
  'chrome:sendToPopup': void
  'chrome:getFromPage': {
    videoData?: VideoData[]
  }
}

export type ChromeResponse<T extends keyof ChromeResponseResult = any> = {
  type: T
  result: ChromeResponseResult[T]
} | void
