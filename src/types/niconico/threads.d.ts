import type { V1Thread } from '@xpadev-net/niconicomments'

export type Threads = {
  meta: Meta
  data: Data
}

export type Meta = {
  status: number
}

export type Data = {
  globalComments: GlobalComment[]
  threads: V1Thread[]
}

export type GlobalComment = {
  id: string
  count: number
}
