export interface GetTitle {
  data: Data
}

export interface Data {
  webfront_title_stage: WebfrontTitleStage
  webfront_title_titleEpisodes: WebfrontTitleTitleEpisodes
}

export interface WebfrontTitleStage {
  id: string
  titleName: string
  publishStyleCode: string
  episode: WebfrontTitleStageEpisode
  __typename: string
}

export interface WebfrontTitleStageEpisode {
  id: string
  hasSubtitle: boolean
  hasDub: boolean
  __typename: EpisodeTypename
}

export type EpisodeTypename = 'Episode'

export interface WebfrontTitleTitleEpisodes {
  episodes: EpisodeElement[]
  __typename: string
}

export interface EpisodeElement {
  id: string
  episodeName: string
  displayNo: string
  thumbnail: Thumbnail
  duration: number
  interruption: number
  completeFlag: boolean
  __typename: EpisodeTypename
}

export interface Thumbnail {
  standard: string
  __typename: ThumbnailTypename
}

export type ThumbnailTypename = 'Thumbnail'
