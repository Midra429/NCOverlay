import type { NvCommentBody } from '@/background/api/niconico/threads'
import type { SearchData } from './niconico/search'
import type { VideoData } from './niconico/video'
import type { ThreadsData } from './niconico/threads'

type ChromeMessageTypes =
  | 'niconico:search'
  | 'niconico:video'
  | 'niconico:threads'
  | 'chrome:badge'

type ChromeMessageBodySearch = {
  title: string
  duration: number
}

type ChromeMessageBodyVideo = {
  videoId: string
  guest?: boolean
}

type ChromeMessageBodyThreads = {
  nvComment: NvCommentBody
}

export type ChromeMessage<T extends ChromeMessageTypes = any> = {
  id: number | string
  type: T
  body: T extends 'niconico:search'
    ? ChromeMessageBodySearch
    : T extends 'niconico:video'
    ? ChromeMessageBodyVideo
    : T extends 'niconico:threads'
    ? ChromeMessageBodyThreads
    : T extends 'chrome:badge'
    ? string
    : void
}

export type ChromeResponse<T extends ChromeMessageTypes = any> = {
  id: number | string
  type: T
  result: T extends 'niconico:search'
    ? SearchData[] | null
    : T extends 'niconico:video'
    ? VideoData | null
    : T extends 'niconico:threads'
    ? ThreadsData | null
    : T extends 'chrome:badge'
    ? void
    : void
}
