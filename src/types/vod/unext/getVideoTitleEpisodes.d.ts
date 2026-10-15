export interface GetVideoTitleEpisodes {
  data: Data
}

export interface Data {
  webfront_title_titleEpisodes: WebfrontTitleTitleEpisodes
}

export interface WebfrontTitleTitleEpisodes {
  episodes: Episode[]
  pageInfo: PageInfo
}

export interface Episode {
  id: string
  episodeName: string
  purchaseEpisodeLimitday: string
  thumbnail: Thumbnail
  duration: number
  displayNo: string
  interruption: number
  completeFlag: boolean
  saleTypeCode: SaleTypeCode
  introduction: string
  saleText: string
  episodeNotices: unknown[]
  isNew: boolean
  hasPackRights: boolean
  minimumPrice: number
  hasMultiplePrices: boolean
  productLineupCodeList: ProductLineupCodeList[]
  isPurchased: boolean
  audioTrackList: unknown[]
  subtitleTrackList: unknown[]
}

export type ProductLineupCodeList = 'LNPS_NOD' | 'LNPS_VOD' | 'LNPS_SVOD'

export type SaleTypeCode = 'SOD'

export interface Thumbnail {
  standard: string
}

export interface PageInfo {
  page: number
  pages: number
  pageSize: number
  results: number
}
