/** NCOverlayによる追加情報 */
type NCOExtraInfo = {
  type: 'normal' | 'splited'
}

export type Video = {
  meta: VideoMeta
  data: VideoData
}

export type VideoMeta = {
  status: number
}

export type VideoData = {
  _nco_extra_info?: NCOExtraInfo // NCOverlayによる追加情報

  ads: null
  category: null
  channel: Channel | null
  client: Client
  comment: DataComment
  community: null
  easyComment: EasyComment
  external: External
  genre: DataGenre
  marquee: Marquee
  media: Media
  okReason: string
  owner: DataOwner | null
  payment: Payment
  pcWatchPage: PCWatchPage
  player: Player
  ppv: null
  ranking: Ranking
  series: Series | null
  smartphone: null
  system: System
  tag: Tag
  video: DataVideo
  videoAds: VideoAds
  videoLive: null
  viewer: DataViewer
  waku: Waku
}

export type Channel = {
  id: string
  name: string
  isOfficialAnime: boolean
  isDisplayAdBanner: boolean
  thumbnail: ChannelThumbnail
  viewer: ChannelViewer
}

export type ChannelThumbnail = {
  url: string
  smallUrl: string
}

export type ChannelViewer = {
  follow: Follow
}

export type Follow = {
  isFollowed: boolean
  isBookmarked: boolean
  token: string
  tokenTimestamp: number
}

export type Client = {
  nicosid: string
  watchId: string
  watchTrackId: string
}

export type DataComment = {
  server: Server
  keys: Keys
  layers: Layer[]
  threads: Thread[]
  ng: Ng
  isAttentionRequired: boolean
  nvComment: NvComment
}

export type Keys = {
  userKey: string
}

export type Layer = {
  index: number
  isTranslucent: boolean
  threadIds: ThreadID[]
}

export type ThreadID = {
  id: number
  fork: number
  forkLabel: string
}

export type Ng = {
  ngScore: NgScore
  channel: any[]
  owner: any[]
  viewer: NgViewer
}

export type NgScore = {
  isDisabled: boolean
}

export type NgViewer = {
  revision: number
  count: number
  items: ViewerItem[]
}

export type ViewerItem = {
  type: Type
  source: string
  registeredAt: Date
}

export type Type = 'id' | 'command'

export type NvComment = {
  threadKey: string
  server: string
  params: Params
}

export type Params = {
  targets: Target[]
  language: string
}

export type Target = {
  id: string
  fork: string
}

export type Server = {
  url: string
}

export type Thread = {
  id: number
  fork: number
  forkLabel: string
  videoId: string
  isActive: boolean
  isDefaultPostTarget: boolean
  isEasyCommentPostTarget: boolean
  isLeafRequired: boolean
  isOwnerThread: boolean
  isThreadkeyRequired: boolean
  threadkey: null | string
  is184Forced: boolean
  hasNicoscript: boolean
  label: string
  postkeyStatus: number
  server: string
}

export type EasyComment = {
  phrases: Phrase[]
}

export type Phrase = {
  text: string
  nicodic: Nicodic
}

export type Nicodic = {
  title: string
  viewTitle: string
  summary: string
  link: string
}

export type External = {
  commons: Commons
  ichiba: Ichiba
}

export type Commons = {
  hasContentTree: boolean
}

export type Ichiba = {
  isEnabled: boolean
}

export type DataGenre = {
  key: string
  label: string
  isImmoral: boolean
  isDisabled: boolean
  isNotSet: boolean
}

export type Marquee = {
  isDisabled: boolean
  tagRelatedLead: null
}

export type Media = {
  delivery: Delivery
  deliveryLegacy: null
}

export type Delivery = {
  recipeId: string
  encryption: null
  movie: Movie
  storyboard: null
  trackingId: string
}

export type Movie = {
  contentId: string
  audios: Audio[]
  videos: VideoElement[]
  session: Session
}

export type Audio = {
  id: string
  isAvailable: boolean
  metadata: AudioMetadata
}

export type AudioMetadata = {
  bitrate: number
  samplingRate: number
  loudness: Loudness
  levelIndex: number
  loudnessCollection: LoudnessCollection[]
}

export type Loudness = {
  integratedLoudness: number
  truePeak: number
}

export type LoudnessCollection = {
  type: string
  value: number
}

export type Session = {
  recipeId: string
  playerId: string
  videos: string[]
  audios: string[]
  movies: any[]
  protocols: string[]
  authTypes: AuthTypes
  serviceUserId: string
  token: string
  signature: string
  contentId: string
  heartbeatLifetime: number
  contentKeyTimeout: number
  priority: number
  transferPresets: any[]
  urls: URL[]
}

export type AuthTypes = {
  http: string
  hls: string
}

export type URL = {
  url: string
  isWellKnownPort: boolean
  isSsl: boolean
}

export type VideoElement = {
  id: string
  isAvailable: boolean
  metadata: VideoMetadata
}

export type VideoMetadata = {
  label: string
  bitrate: number
  resolution: Resolution
  levelIndex: number
  recommendedHighestAudioLevelIndex: number
}

export type Resolution = {
  width: number
  height: number
}

export type DataOwner = {
  id: number
  nickname: string
  iconUrl: string
  channel: null
  live: null
  isVideosPublic: boolean
  isMylistsPublic: boolean
  videoLiveNotice: null
  viewer: OwnerViewer
}

export type OwnerViewer = {
  isFollowing: boolean
}

export type Payment = {
  video: PaymentVideo
  preview: Preview
}

export type Preview = {
  ppv: Ichiba
  admission: Ichiba
  continuationBenefit: Ichiba
  premium: Ichiba
}

export type PaymentVideo = {
  isPpv: boolean
  isAdmission: boolean
  isContinuationBenefit: boolean
  isPremium: boolean
  watchableUserType: string
  commentableUserType: string
}

export type PCWatchPage = {
  tagRelatedBanner: null
  videoEnd: VideoEnd
  showOwnerMenu: boolean
  showOwnerThreadCoEditingLink: boolean
  showMymemoryEditingLink: boolean
}

export type VideoEnd = {
  bannerIn: null
  overlay: null
}

export type Player = {
  initialPlayback: InitialPlayback | null
  comment: PlayerComment
  layerMode: number
}

export type PlayerComment = {
  isDefaultInvisible: boolean
}

export type InitialPlayback = {
  type: string
  positionSec: null
}

export type Ranking = {
  genre: RankingGenre
  popularTag: PopularTag[]
}

export type RankingGenre = {
  rank: number
  genre: string
  dateTime: Date
}

export type PopularTag = {
  tag: string
  regularizedTag: string
  rank: number
  genre: string
  dateTime: Date
}

export type Series = {
  id: number
  title: string
  description: string
  thumbnailUrl: string
  video: SeriesVideo
}

export type SeriesVideo = {
  prev: First
  next: null
  first: First
}

export type First = {
  type: string
  id: string
  title: string
  registeredAt: Date
  count: Count
  thumbnail: FirstThumbnail
  duration: number
  shortDescription: string
  latestCommentSummary: string
  isChannelVideo: boolean
  isPaymentRequired: boolean
  playbackPosition: number | null
  owner: FirstOwner
  requireSensitiveMasking: boolean
  videoLive: null
  isMuted: boolean
}

export type Count = {
  view: number
  comment: number
  mylist: number
  like: number
}

export type FirstOwner = {
  ownerType: string
  type: string
  visibility: string
  id: string
  name: string
  iconUrl: string
}

export type FirstThumbnail = {
  url: string
  middleUrl: string
  largeUrl: string
  listingUrl: string
  nHdUrl: string
}

export type System = {
  serverTime: Date
  isPeakTime: boolean
}

export type Tag = {
  items: TagItem[]
  hasR18Tag: boolean
  isPublishedNicoscript: boolean
  edit: Edit
  viewer: Edit
}

export type Edit = {
  isEditable: boolean
  uneditableReason: null | string
  editKey: string
}

export type TagItem = {
  name: string
  isCategory: boolean
  isCategoryCandidate: boolean
  isNicodicArticleExists: boolean
  isLocked: boolean
}

export type DataVideo = {
  id: string
  title: string
  description: string
  count: Count
  duration: number
  thumbnail: VideoThumbnail
  rating: Rating
  registeredAt: Date
  isPrivate: boolean
  isDeleted: boolean
  isNoBanner: boolean
  isAuthenticationRequired: boolean
  isEmbedPlayerAllowed: boolean
  isGiftAllowed: boolean
  viewer: VideoViewer
  watchableUserTypeForPayment: string
  commentableUserTypeForPayment: string
}

export type Rating = {
  isAdult: boolean
}

export type VideoThumbnail = {
  url: string
  middleUrl: string
  largeUrl: string
  player: string
  ogp: string
}

export type VideoViewer = {
  isOwner: boolean
  like: Like
}

export type Like = {
  isLiked: boolean
  count: null
}

export type VideoAds = {
  additionalParams: VideoAdsAdditionalParams
  items: VideoAdsItem[]
  reason: string
}

export type VideoAdsAdditionalParams = {
  videoId: string
  videoDuration: number
  isAdultRatingNG: boolean
  isAuthenticationRequired: boolean
  isR18: boolean
  nicosid: string
  lang: string
  watchTrackId: string
  channelId?: string
  genre: string
  gender: string
  age: number
}

export type VideoAdsItem = {
  type: string
  timingMs: number | null
  additionalParams: ItemAdditionalParams
}

export type ItemAdditionalParams = {
  linearType: string
  adIdx: number
  skipType: number
  skippableType: number
  pod: number
}

export type DataViewer = {
  id: number
  nickname: string
  isPremium: boolean
  allowSensitiveContents: boolean
  existence: Existence
}

export type Existence = {
  age: number
  prefecture: string
  sex: string
}

export type Waku = {
  information: null
  bgImages: any[]
  addContents: null
  addVideo: null
  tagRelatedBanner: TagRelatedBanner
  tagRelatedMarquee: TagRelatedMarquee
}

export type TagRelatedBanner = {
  title: string
  imageUrl: string
  description: string
  isEvent: boolean
  linkUrl: string
  linkType: string
  linkOrigin: string
  isNewWindow: boolean
}

export type TagRelatedMarquee = {
  title: string
  linkUrl: string
  linkType: string
  linkOrigin: string
  isNewWindow: boolean
}
