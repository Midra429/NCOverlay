export interface GetPostPlay {
  data: Data
}

export interface Data {
  webfront_postPlay: WebfrontPostPlay
}

export interface WebfrontPostPlay {
  resultType: string
  nextEpisode: NextEpisode | null
  recommendations: null
}

export interface NextEpisode {
  episodeCode: string
  titleCode: string
  titleName: string
  episodeName: string
  displayNo: string
  productLineupCodeList: ProductLineupCodeList[]
  paymentBadgeList: PaymentBadgeList[]
  thumbnail: Thumbnail
  hasPackRights: boolean
  publicMainEpisodeCount: number
  platformLabels: unknown[]
}

export type ProductLineupCodeList = 'LNPS_NOD' | 'LNPS_VOD' | 'LNPS_SVOD'

export interface PaymentBadgeList {
  id: string
  code: string
  name: string
}

export interface Thumbnail {
  standard: string
  secondary: string
}
