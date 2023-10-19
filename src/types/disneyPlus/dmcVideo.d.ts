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
  encodedSeriesId: string
  episodeNumber: null
  episodeSequenceNumber: number
  episodeSeriesSequenceNumber: number
  family: Family
  groups: Group[]
  internalTitle: string
  image: Image
  labels: Label[]
  league: null
  mediaMetadata: MediaMetadata
  meta: null
  mediaRights: MediaRights
  milestone: Milestone
  originalLanguage: Language
  participant: Participant
  programId: string
  programType: string
  ratings: Rating[]
  releases: Release[]
  seasonId: string
  seasonSequenceNumber: number
  seriesId: string
  seriesType: string
  sport: null
  tags: Tag[]
  targetLanguage: Language
  text: Text
  type: string
  typedGenres: any[]
  videoArt: any[]
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
  encodedSeriesId: string
  programId: string
  seasonId: string
  seriesId: string
}

export type Group = {
  name: string
  partnerGroupId: string
  type: string
}

export type Image = {
  title_treatment_layer: { [key: string]: HeroTile }
  title_treatment: TitleTreatment
  hero: { [key: string]: BackgroundDetail }
  tile_partner: BackgroundUnauthenticated
  title_treatment_centered: TitleTreatmentCentered
  tile: { [key: string]: BackgroundDetail }
  thumbnail: Thumbnail
  hero_tile: { [key: string]: HeroTile }
  background_up_next: BackgroundUnauthenticated
  title_treatment_mono: TitleTreatmentMono
  background_unauthenticated: BackgroundUnauthenticated
  background_details: { [key: string]: BackgroundDetail }
  thumbnail_partner: BackgroundUnauthenticated
  hero_collection: BackgroundUnauthenticated
}

export type BackgroundDetail = {
  series: Series
}

export type Series = {
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

export type HeroTile = {
  program?: Series
  series: Series
}

export type Thumbnail = {
  '1.78': The178
}

export type The178 = {
  program: Series
}

export type TitleTreatment = {
  '3.32': BackgroundDetail
  '1.78': HeroTile
}

export type TitleTreatmentCentered = {
  '1.78': HeroTile
}

export type TitleTreatmentMono = {
  '3.32': BackgroundDetail
}

export type Label = {
  region: string
  value: string
}

export type MediaMetadata = {
  activeAspectRatio: number
  audioTracks: AudioTrack[]
  captions: any[]
  facets: Facet[]
  features: any[]
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
  features: string[]
  language: Language
  name: null
  renditionName: string
  trackType: string
}

export type Language = 'ja'

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
  intro_start: Ffec[]
  FFEI: Ffec[]
  intro_end: Ffec[]
  FFEC: Ffec[]
  up_next: Ffec[]
  LFEC: Ffec[]
  FFOC?: Ffec[]
  LFOC?: Ffec[]
}

export type Ffec = {
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
}

export type Actor = {
  characterDetails: CharacterDetails
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
  season: Program
  program: Program
  series: Program
}

export type Program = {
  default: SeasonDefault
}

export type SeasonDefault = {
  content: string
  language: Language
  sourceEntity: SourceEntity
}

export type SourceEntity = 'program' | 'season' | 'series'

export type Title = {
  full: Brief
  sort: Brief
  slug: Brief
}
