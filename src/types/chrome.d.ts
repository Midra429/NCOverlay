import type { NvCommentBody } from '@/api/niconico/threads'
import type { Search } from './niconico/search'
import type { Video } from './niconico/video'
import type { Threads } from './niconico/threads'

type ChromeMessageTypes = 'search' | 'video' | 'threads'

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
  body: T extends 'search'
    ? ChromeMessageBodySearch
    : T extends 'video'
    ? ChromeMessageBodyVideo
    : T extends 'threads'
    ? ChromeMessageBodyThreads
    : any
}

export type ChromeResponse<T extends ChromeMessageTypes = any> = {
  id: number | string
  type: T
  result: T extends 'search'
    ? Search | null
    : T extends 'video'
    ? Video | null
    : T extends 'threads'
    ? Threads | null
    : any
}
