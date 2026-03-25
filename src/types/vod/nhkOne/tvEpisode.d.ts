export interface TvEpisode {
  '@context': string
  '@type': string
  '@id': string
  url: string
  name: Description
  description: Description
  partOfSeries: PartOfSeries
  image: TvEpisodeImage
  releasedEvent: ReleasedEvent
  actor: ActorElement[]
  contributor: any[]
  identifier: TvEpisodeIdentifier[]
}

export interface ActorElement {
  '@type': string
  roleName: Description
  image: ActorImage
  actor: ActorActor
  description?: Description
}

export interface ActorActor {
  '@type': string
  name: Description
  familyName: Description
  givenName: Description
  identifier: ActorIdentifier[]
  jobTitle: string[]
}

export interface Description {
  '@value': string
  '@language': Language
}

export type Language = 'ja'

export interface ActorIdentifier {
  '@type': Type
  name: string
  value: string
}

export type Type = 'PropertyValue'

export interface ActorImage {
  '@type': string
  contentUrl: string
}

export interface TvEpisodeIdentifier {
  '@type': Type
  propertyID: PropertyId
  value: string
}

export type PropertyId = 'TVSeriesID' | 'TVEpisodeID'

export interface TvEpisodeImage {
  '@type': string
  contentUrl: string
  width: string
  height: string
}

export interface PartOfSeries {
  '@type': string
  '@id': string
  url: string
  name: Description
  description: Description
  image: PartOfSeriesImage
}

export interface PartOfSeriesImage {
  '@type': string
  contentUrl: string
  width: number
  height: number
}

export interface ReleasedEvent {
  '@type': string
  startDate: string
  endDate: string
  location: Location
}

export interface Location {
  '@type': string
  name: string
}
