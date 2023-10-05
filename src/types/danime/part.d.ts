export type Part = {
  resultCd: string
  version: string
  selfLink: string
  data: PartData
}

export type PartData = {
  appType: string
  partId: string
  workTitle: string
  workTitleKana: string
  mainKeyVisualPath: string
  partDispNumber: string
  partExp: string
  partTitle: string
  partMeasureSecond: number
  mainScenePath: string
  partIndex: number
  serviceId: string
  oneTimeKey: string
  viewOneTimeToken: string
  movieFilename: any
  movieFileSize: any
  movieFileSizeList: any
  title: string
  webInitiatorUri: string
  contentUri: string[]
  contentUrls: ContentUrls
  defaultPlay: string
  laUrl: string
  castCustomDataUrl: string
  castOneTimeKey: string
  castContentUri: string
  apiUrl: string
  thumbnailUrl: string
  startStatus: string
  resumePoint: number
  resumePointLastUpdate: number
  resumeInfoUrl: string
  resumeInfoUrlExpiration: number
  keepAliveInterval: number
  resumeInfoSendMode: number
  resumeFlag: string
  multideviceState: number
  snsTwitter: string
  snsFacebook: string
  snsGoogle: string
  snsHatebu: string
  snsLine: string
  prevTitle: any
  prevContentInfoUri: any
  nextTitle: string
  nextMainScenePath: string
  nextPartDispNumber: string
  nextPartTitle: string
  nextPartExp: string
  nextContentInfoUri: string
  previousWebViewUrl: any
  adPartId: any
  adContentUri: any
  advertiser: any
  adClickUri: any
  adNotifyUri: any
  adSkipCount: any
  recommendContentInfo: any
  animeNextContentInfoTitle: string
  animeRecommendInfoTitle: string
  bookWorkInfoTitle: string
  bookRecommendInfoTitle: string
  bookRecommendInfoUri: string
  productsRecommendInfoTitle: string
  productsRecommendInfoUri: string
  goodsProductsDetailInfoUri: string
  bookSpecifiedVolumeInfoTitle: string
  bookSpecifiedVolumeInfoUri: string
  afterJoinPromotionBannerUrl: any
  opSkipAvailable: string
}

export type ContentUrls = {
  highest: string
  high: string
  middle: string
  low: string
  lowest: string
}
