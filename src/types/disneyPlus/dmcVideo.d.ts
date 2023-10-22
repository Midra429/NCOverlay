export type DmcVideo = {
  data: Data
}

export type Data = {
  DmcVideo: DmcVideoClass
}

export type DmcVideoClass = {
  video: Video
}

export type Video = {
  badging: null
  callToAction: null
  channel: null
  contentId: string
  contentType: string
  currentAvailability: CurrentAvailability
  event: null
  encodedSeriesId: null | string
  episodeNumber: null
  episodeSequenceNumber: number | null
  episodeSeriesSequenceNumber: number | null
  family: Family
  groups: Group[]
  internalTitle: string
  image: Image
  labels: Label[]
  league: null
  mediaMetadata: VideoMediaMetadata
  meta: null
  mediaRights: MediaRights
  milestone: { [key: string]: Milestone[] }
  originalLanguage: string
  participant: Participant
  programId: string
  programType: string
  ratings: Rating[]
  releases: Release[]
  seasonId: null | string
  seasonSequenceNumber: number | null
  seriesId: null | string
  seriesType: null | string
  sport: null
  tags: Tag[]
  targetLanguage: string
  text: Text
  type: string
  typedGenres: TypedGenre[]
  videoArt: VideoArt[]
  videoId: string
}

export type CurrentAvailability = {
  region: string
  kidsMode: boolean
}

export type Family = {
  encodedFamilyId: string
  familyId: string
  parent: boolean
  parentRef: ParentRef
  sequenceNumber: null
}

export type ParentRef = {
  encodedSeriesId: null | string
  programId: string
  seasonId: null | string
  seriesId: null | string
}

export type Group = {
  name: string
  partnerGroupId: string
  type: string
}

export type Image = {
  title_treatment_layer: { [key: string]: BackgroundDetail }
  title_treatment: { [key: string]: BackgroundDetail }
  hero: { [key: string]: BackgroundDetail }
  tile_partner: TilePartner
  title_treatment_centered: BackgroundUnauthenticated
  tile: { [key: string]: BackgroundDetail }
  thumbnail?: Thumbnail
  hero_tile: { [key: string]: BackgroundDetail }
  background_up_next: BackgroundUnauthenticated
  title_treatment_mono?: TitleTreatmentMono
  background_unauthenticated?: BackgroundUnauthenticated
  background_details: { [key: string]: BackgroundDetail }
  thumbnail_partner?: BackgroundUnauthenticated
  hero_collection: BackgroundUnauthenticated
  title_treatment_partner?: BackgroundUnauthenticated
  thumbnail_version_ov_widescreen?: Thumbnail
  hero_partner?: { [key: string]: HeroPartner }
  thumbnail_version_imax_enhanced?: Thumbnail
}

export type BackgroundDetail = {
  series?: BackgroundDetailProgram
  program?: BackgroundDetailProgram
}

export type BackgroundDetailProgram = {
  default: PurpleDefault
}

export type PurpleDefault = {
  masterId: string
  masterWidth: number
  masterHeight: number
  url: string
}

export type BackgroundUnauthenticated = {
  '1.78': BackgroundDetail
}

export type HeroPartner = {
  program: BackgroundDetailProgram
}

export type Thumbnail = {
  '1.78': HeroPartner
}

export type TilePartner = {
  '1.78': BackgroundDetail
  '0.71'?: HeroPartner
}

export type TitleTreatmentMono = {
  '3.32': BackgroundDetail
}

export type Label = {
  region: string
  value: string
}

export type VideoMediaMetadata = {
  activeAspectRatio: number
  audioTracks: AudioTrack[]
  captions: AudioTrack[]
  facets: Facet[]
  features: string[]
  format: string
  mediaId: string
  phase: string
  playbackUrls: PlaybackURL[]
  productType: string
  runtimeMillis: number
  state: string
  type: string
}

export type AudioTrack = {
  features?: Feature[]
  language: string
  name: null
  renditionName: string
  trackType: TrackType
}

export type Feature = 'dolby_20' | 'dolby_51'

export type TrackType = 'PRIMARY' | 'NORMAL' | 'SDH' | 'FORCED'

export type Facet = {
  activeAspectRatio: number
  label: string
}

export type PlaybackURL = {
  rel: string
  href: string
  templated: boolean
  params: Param[]
}

export type Param = {
  name: string
  description: string
}

export type MediaRights = {
  violations: any[]
  downloadBlocked: boolean
  pconBlocked: boolean
  rewind: boolean
}

export type Milestone = {
  id: string
  milestoneTime: MilestoneTime[]
}

export type MilestoneTime = {
  startMillis: number
  type: Type
}

export type Type = 'offset'

export type Participant = {
  Actor: Actor[]
  Director?: Actor[]
  Producer?: Actor[]
}

export type Actor = {
  characterDetails: CharacterDetails | null
  displayName: string
  order: number
  participantId: string
  sortName: string
}

export type CharacterDetails = {
  character: string
  characterId: string
}

export type Rating = {
  advisories: string[]
  description: null
  filingNumber: null
  system: string
  value: string
}

export type Release = {
  releaseDate: Date
  releaseOrg: null
  releaseType: string
  releaseYear: number
  territory: null
}

export type Tag = {
  displayName: null
  type: string
  value: string
}

export type Text = {
  description: Description
  title: Title
}

export type Description = {
  medium: Brief
  full: Brief
  brief: Brief
}

export type Brief = {
  season?: SeasonClass
  program: SeasonClass
  series?: SeasonClass
}

export type SeasonClass = {
  default: SeasonDefault
}

export type SeasonDefault = {
  content: string
  language: Language
  sourceEntity: SourceEntity
}

export type Language = 'ja'

export type SourceEntity = 'program' | 'season' | 'series'

export type Title = {
  full: Brief
  sort: Brief
  slug: Brief
}

export type TypedGenre = {
  name: string
  partnerId: string
  type: string
}

export type VideoArt = {
  mediaMetadata: VideoArtMediaMetadata
  purpose: string
}

export type VideoArtMediaMetadata = {
  urls: URL[]
}

export type URL = {
  url: string
}
