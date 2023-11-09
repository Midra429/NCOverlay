export type Program = {
  id: string
  series: Series
  season?: Season
  genre: Genre
  info: Info
  providedInfo: ProvidedInfo
  episode: Episode
  credit: Credit
  mediaStatus: MediaStatus
  label: ProgramLabel
  imageUpdatedAt: number
  endAt: number
  freeEndAt?: number
  transcodeVersion: string
  sharedLink: SharedLink
  playback: Playback
  viewingPoint: ViewingPoint
  nextProgramInfo?: NextProgramInfo
  download: Download
  externalContent: ExternalContent
  broadcastRegionPolicy: number
  timelineThumbComponent: TimelineThumbComponent
  terms: Term[]
  episodeGroupId: string
}

export type Credit = {
  released: number
  casts: string[]
  crews: string[]
  copyrights: string[]
}

export type Download = {
  enable: boolean
}

export type Episode = {
  number: number
  title: string
  content: string
}

export type ExternalContent = {
  marks: MediaStatus
}

export type MediaStatus = {}

export type Genre = {
  id: string
  name: string
  subGenres: SubGenre[]
}

export type SubGenre = {
  id: string
  name: string
}

export type Info = {
  duration: number
}

export type ProgramLabel = {
  free?: boolean
}

export type NextProgramInfo = {
  programId: string
  title: string
  thumbImg: string
  sceneThumbImages?: string[]
  imageUpdatedAt: number
  endAt: number
  broadcastRegionPolicy: number
  terms: Term[]
}

export type Term = {
  onDemandType: number
  endAt: number
}

export type Playback = {
  hls: string
  dash: string
  hlsPreview?: string
  dashIPTV: string
}

export type ProvidedInfo = {
  thumbImg: string
  sceneThumbImgs?: string[]
}

export type Season = {
  id: string
  sequence: number
  name: string
  thumbComponent: MediaStatus
  order: number
}

export type Series = {
  id: string
  title: string
  label: SeriesLabel
  thumbComponent: ThumbComponent
  thumbPortraitComponent: ThumbComponent
}

export type SeriesLabel = {
  someFree?: boolean
  newest?: boolean
}

export type ThumbComponent = {
  urlPrefix: string
  filename: string
  query: string
  extension: string
}

export type SharedLink = {
  twitter: string
  facebook: string
  google: string
  line: string
  copy: string
  instagram: string
}

export type TimelineThumbComponent = {
  urlPrefix: string
  extension: string
}

export type ViewingPoint = {
  suggestion: number
}
