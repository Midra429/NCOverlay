export interface GetLibraryTop {
  data: Data
}

export interface Data {
  episodeHistory: EpisodeHistory[]
  bookHistory: BookHistory
  purchasedLives: PurchasedLives
}

export interface BookHistory {
  pageInfoHash: PageInfoHash
  books: unknown[]
}

export interface PageInfoHash {
  pageSize: number
  nextPageHash: string
}

export interface EpisodeHistory {
  id: string
  episodeName: string
  episodeTitleInfo: EpisodeTitleInfo
  displayNo: string
  thumbnail: Thumbnail
  interruption: number
  duration: number
  completeFlag: boolean
}

export interface EpisodeTitleInfo {
  id: string
  name: string
}

export interface Thumbnail {
  standard: string
}

export interface PurchasedLives {
  liveList: unknown[]
  pageInfo: PageInfo
}

export interface PageInfo {
  page: number
  pages: number
  pageSize: number
  results: number
}
