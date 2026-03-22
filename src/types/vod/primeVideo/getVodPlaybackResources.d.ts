export interface GetVodPlaybackResources {
  sessionization: Sessionization
  auditPings: AuditPings
  widevineServiceCertificate: WidevineServiceCertificate
  playbackData: PlaybackData
  timedTextUrls: TimedTextUrls
  trickplayUrls: TrickplayUrls
  transitionTimecodes: TransitionTimecodes
  vodPlaylistedPlaybackUrls: VodPlaylistedPlaybackUrls
  vodXrayMetadata: VodXrayMetadata
  __metadata: Metadata
}

export interface Metadata {
  region: string
  id: string
}

export interface AuditPings {
  result: AuditPingsResult
}

export interface AuditPingsResult {}

export interface PlaybackData {
  result: PlaybackDataResult
}

export interface PlaybackDataResult {
  contentId: string
}

export interface Sessionization {
  sessionHandoffToken: string
  drmCaching: string
  sessionTrackingMode: string
}

export interface TimedTextUrls {
  error?: Error
  result?: TimedTextUrlsResult
}

export interface Error {
  code: string
  message: string
}

export interface TimedTextUrlsResult {
  subtitleUrls: EUrl[]
  forcedNarrativeUrls: EUrl[]
}

export interface EUrl {
  displayName: string
  format: Format
  languageCode: LanguageCode
  subtype: Subtype
  trackGroupId: string
  type: ForcedNarrativeUrlType
  url: string
}

export type Format = 'TTMLv2'

export type LanguageCode = 'en-us' | 'ja-jp'

export type Subtype = 'Dialog'

export type ForcedNarrativeUrlType = 'ForcedNarrative' | 'Sdh' | 'Subtitle'

export interface TransitionTimecodes {
  error?: Error
  result?: TransitionTimecodesResult
}

export interface TransitionTimecodesResult {
  events: Event[]
}

export interface Event {
  startTimeMs: number
  eventType: string
  intervals: Interval[]
}

export interface Interval {
  startTimeMs: number
}

export interface TrickplayUrls {
  error?: Error
  result?: TrickplayUrlsResult
}

export interface TrickplayUrlsResult {
  trickplayUrls: TrickplayUrl[]
}

export interface TrickplayUrl {
  cdn: string
  trickplayUrl: string
  trickplayResolution: string
}

export interface VodPlaylistedPlaybackUrls {
  result: VodPlaylistedPlaybackUrlsResult
}

export interface VodPlaylistedPlaybackUrlsResult {
  playbackUrls: PlaybackUrls
  playbackSettings: PlaybackSettings
}

export interface PlaybackSettings {
  result: PlaybackSettingsResult
}

export interface PlaybackSettingsResult {
  formatVersion: string
  settingsId: string
  callback: Callback
  caching: ResultCaching
  playbackSettings: string
}

export interface ResultCaching {
  timeToLiveIso8601: string
  timeToLive: string
}

export interface Callback {
  url: string
  delayIso8601: string
  delay: string
}

export interface PlaybackUrls {
  fullTitleDurationMs: number
  failoverPolicy: FailoverPolicy
  timedTextRepresentation: string
  intraTitlePlaylist: IntraTitlePlaylist[]
  pauseBehavior?: string
  pauseAdsResolution?: PauseAdsResolution
}

export interface FailoverPolicy {
  cdnOrder: Cdn[]
}

export type Cdn = 'cloudfront' | 'akamai' | 'fastly'

export interface IntraTitlePlaylist {
  type: IntraTitlePlaylistType
  startMs?: number
  endMs?: number
  urls?: Url[]
  nonLinearAds?: any[]
  audioTracks?: AudioTrack[]
  manifestMetadata?: ManifestMetadata
  caching: IntraTitlePlaylistCaching
  resolutionConstraints?: ResolutionConstraints
  urlsInPriorityOrder?: string[]
  shouldShowOnScrubBar?: boolean
  defaultAudioTrackId?: AudioTrackId
}

export interface AudioTrack {
  audioTrackId: AudioTrackId
  displayName: DisplayName
  languageCode: LanguageCode
  audioSubtype: AudioSubtype
  trackGroupId: string
}

export type AudioSubtype =
  | 'dialog'
  | 'descriptive'
  | 'boosteddialogmedium'
  | 'boosteddialoghigh'

export type AudioTrackId =
  | 'ja-jp_dialog_0'
  | 'en-us_dialog_0'
  | 'en-us_descriptive_0'
  | 'en-us_boosteddialogmedium_0'
  | 'en-us_boosteddialoghigh_0'

export type DisplayName =
  | '日本語'
  | 'English'
  | 'English [Audio Description]'
  | 'English Dialogue Boost: Medium'
  | 'English Dialogue Boost: High'

export interface IntraTitlePlaylistCaching {
  timeToLive: TimeToLive
}

export type TimeToLive = 'PT120H' | 'PT24H'

export interface ManifestMetadata {
  bitrateAdaptation: BitrateAdaptation
  codec: Codec
  dynamicRange: DynamicRange
  frameRate: FrameRate
  isFmmCompatible: boolean
  resolution: Resolution
  streamingProtocol: StreamingProtocol
  videoQuality: VideoQuality
}

export type BitrateAdaptation = 'CVBR'

export type Codec = 'H264'

export type DynamicRange = 'None'

export type FrameRate = 'Standard'

export type Resolution = 'HD_1080P' | 'HD_720P' | 'SD_576P'

export type StreamingProtocol = 'DASH'

export type VideoQuality = 'HD' | 'SD'

export interface ResolutionConstraints {
  maxMsInAdvance: number
  mayResolveBeforePlayStart: boolean
  timeoutInMs: number
  maxAttemptsPerUrl: number
}

export type IntraTitlePlaylistType = 'Main' | 'Remote'

export interface Url {
  url: string
  cdn: Cdn
  origin: Origin
  consumptionId: string
}

export type Origin = 'ssai_s3_ww_nrt' | 'ssai_s3_iad_2'

export interface PauseAdsResolution {
  pauseAdsResolutionUrl: string
  pauseAdsRequestPolicy: PauseAdsRequestPolicy
}

export interface PauseAdsRequestPolicy {
  canPrefetch: boolean
}

export interface VodXrayMetadata {
  error: Error
}

export interface WidevineServiceCertificate {
  result: WidevineServiceCertificateResult
}

export interface WidevineServiceCertificateResult {
  encodedServiceCertificate: string
}
