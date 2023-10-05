import type { V1Thread } from '@xpadev-net/niconicomments'

export type Threads = {
  meta: ThreadsMeta
  data: ThreadsData
}

export type ThreadsMeta = {
  status: number
}

export type ThreadsData = {
  globalComments: GlobalComment[]
  threads: V1Thread[]
}

export type GlobalComment = {
  id: string
  count: number
}
