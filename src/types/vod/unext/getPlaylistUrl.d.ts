export interface GetPlaylistUrl {
  data: Data
}

export interface Data {
  webfront_playlistUrl: WebfrontPlaylistUrl
}

export interface WebfrontPlaylistUrl {
  subTitle: string
  playToken: string
  playTokenHash: string
  beaconSpan: number
  result: Result
  resultStatus: number
  licenseExpireDate: string
  urlInfo: UrlInfo[]
}

export interface Result {
  errorCode: string
  errorMessage: string
}

export interface UrlInfo {
  code: string
  startPoint: number
  resumePoint: number
  endPoint: number
  endrollStartPosition: number
  holderId: string
  saleTypeCode: string
  sceneSearchList: SceneSearchList
  movieProfile: MovieProfile[]
  umcContentId: string
  movieSecurityLevelCode: string
  captionFlg: boolean
  dubFlg: boolean
  commodityCode: string
  movieAudioList: MovieAudioList[]
  moviePartsPositionList: MoviePartsPositionList[]
}

export interface MovieAudioList {
  audioType: AudioType
}

export type AudioType = 'mp4a'

export interface MoviePartsPositionList {
  type: MoviePartsPositionListType
  fromSeconds: number
  endSeconds: number
  hasRemainingPart: boolean | null
}

export type MoviePartsPositionListType = 'OPENING' | 'ENDING'

export interface MovieProfile {
  cdnId: string
  type: string
  playlistUrl: string
  movieAudioList: MovieAudioList[]
  licenseUrlList: LicenseUrlList[]
}

export interface LicenseUrlList {
  type: Type
  licenseUrl: string
}

export type Type = 'WIDEVINE' | 'PLAYREADY' | 'FAIRPLAY'

export interface SceneSearchList {
  IMS_AD1: string
  IMS_L: string
  IMS_M: string
  IMS_S: string
}
