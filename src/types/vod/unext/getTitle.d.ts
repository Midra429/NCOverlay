export interface GetTitle {
  data: Data
}

export interface Data {
  webfront_title_stage: WebfrontTitleStage
}

export interface WebfrontTitleStage {
  id: string
  titleName: string
  publishStyleCode: string
  nextUpdateDateTime: unknown
  totalEpisodes: number
  episode: WebfrontTitleStageEpisode
}

export interface WebfrontTitleStageEpisode {
  id: string
  hasSubtitle: boolean
  hasDub: boolean
}
