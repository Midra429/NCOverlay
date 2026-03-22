export interface PlayerChromeResources {
  resources: Resources
}

export interface Resources {
  catalogMetadataV2: CatalogMetadataV2
}

export interface CatalogMetadataV2 {
  catalog: Catalog
  images: Images
}

export interface Catalog {
  type: string
  entityType: string
  title: string
  seriesTitle?: string
  episodeNumber?: number
  seasonNumber?: number
  originalLanguages: string[]
}

export interface Images {
  coverImage: string
  boxartImage: string
  heroImage?: string
}
