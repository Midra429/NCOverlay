import type { DateTimeDuration } from '@internationalized/date'
import type {
  JikkyoChannelId,
  NiconicoGenre,
} from '@midra/nco-utils/types/api/constants'
import type { SearchQuerySort } from '@midra/nco-utils/types/api/niconico/search'
import type { NCOStateItems, StateSlotDetail } from '@/ncoverlay/state'
import type { PluginKey, VodKey } from '@/types/constants'

export type CommentCustomizeTarget = Exclude<StateSlotDetail['type'], 'chapter'>

export interface CommentCustomizeData {
  color?: string
  opacity?: number
}

export type CommentCustomize = {
  [K in CommentCustomizeTarget]?: CommentCustomizeData
}

export type AutoSearchTarget = Exclude<
  StateSlotDetail['type'],
  'normal' | 'file'
>

export interface NgSettingsContent {
  content: string
  isRegExp?: boolean
}

export interface NgSettings {
  words: NgSettingsContent[]
  commands: NgSettingsContent[]
  ids: NgSettingsContent[]
}

export type NgSharingLevel = 'none' | 'low' | 'middle' | 'high'

export interface InternalItems {
  _migrate_version: number
}

export interface StorageItems_v2 {
  /**
   * コメント:自動検索
   * @default true
   */
  'comment:autoLoads': ('normal' | 'szbh' | 'chapter' | 'jikkyo')[]
}

export interface StorageItems_v3 {
  /**
   * NG設定:ニコニコ側のNG設定を使用
   * @default false
   */
  'ng:useNiconicoAccount': boolean
}

export interface StorageItems_v4 {
  /**
   * 自動検索:検索対象
   * @default true
   */
  'comment:autoLoads': AutoSearchTarget[]

  /**
   * 自動検索:実況チャンネル
   * @default []
   */
  'comment:jikkyoChannelIds': JikkyoChannelId[]
}

export interface SettingItems {
  // 全般 //////////////////////////////////////////////////
  /**
   * テーマ
   * @default 'auto'
   */
  theme: 'auto' | 'light' | 'dark'

  /**
   * 動画配信サービス
   * @default []
   */
  vods: VodKey[]

  /**
   * キャプチャ: 形式
   * @default 'jpeg'
   */
  'capture:format': 'jpeg' | 'png'

  /**
   * キャプチャ: 方式
   * @default 'jpeg'
   */
  'capture:method': 'window' | 'copy'

  /**
   * 更新内容を表示
   * @default true
   */
  showChangelog: boolean

  /**
   * かわいい率を表示
   * @default false
   */
  showKawaiiPct: boolean

  // コメント //////////////////////////////////////////////////
  /**
   * コメント:フレームレート
   * @description 30, 60, 0 (無制限)
   * @default 60
   */
  'comment:fps': 30 | 60 | 0

  /**
   * コメント:不透明度
   * @description 0 ~ 100%
   * @default 100
   */
  'comment:opacity': number

  /**
   * コメント:表示サイズ
   * @description 50 ~ 100%
   * @default 100
   */
  'comment:scale': number

  /**
   * コメント:速度
   * @description 0.25 〜 x2
   * @default 1
   */
  'comment:speed': number

  /**
   * コメント:カスタマイズ
   */
  'comment:customize': CommentCustomize

  /**
   * コメント:表示量
   * @description 1 ~ 10倍
   * @default 1
   */
  'comment:amount': number

  /**
   * コメント:ニコニコのログイン情報を使用
   * @default true
   */
  'comment:useNiconicoCredentials': boolean

  /**
   * コメント:コメントアシストの表示を抑制
   * @default false
   */
  'comment:hideAssistedComments': boolean

  /**
   * コメント:実況: オフセット自動調節
   * @default false
   */
  'comment:adjustJikkyoOffset': boolean

  // 自動検索 //////////////////////////////////////////////////
  /**
   * 自動検索:検索対象
   * @default ['official', 'danime', 'chapter']
   */
  'autoSearch:targets': AutoSearchTarget[]

  /**
   * 自動検索:実況: チャンネル
   * @default Object.keys(JIKKYO_CHANNELS)
   */
  'autoSearch:jikkyoChannelIds': JikkyoChannelId[]

  /**
   * 自動検索:実況: 再放送を除外する
   * @default false
   */
  'autoSearch:jikkyoIgnoreRerun': boolean

  /**
   * 自動検索:実況: オフセット自動調節可のみ
   * @default false
   */
  'autoSearch:jikkyoOnlyAdjustable': boolean

  /**
   * 自動検索:手動で実行
   * @default false
   */
  'autoSearch:manual': boolean

  // NG設定 //////////////////////////////////////////////////
  /**
   * NG設定:コメント
   * @default []
   */
  'ng:words': NgSettings['words']

  /**
   * NG設定:コマンド
   * @default []
   */
  'ng:commands': NgSettings['commands']

  /**
   * NG設定:ユーザーID
   * @default []
   */
  'ng:ids': NgSettings['ids']

  /**
   * NG設定:サイズの大きいコメントを非表示
   * @default false
   */
  'ng:largeComments': boolean

  /**
   * NG設定:固定コメントを非表示
   * @default false
   */
  'ng:fixedComments': boolean

  /**
   * NG設定:色付きコメントを非表示
   * @default false
   */
  'ng:coloredComments': boolean

  /**
   * NG設定:NG共有レベル
   * @default 'none'
   */
  'ng:sharingLevel': NgSharingLevel

  // キーボード //////////////////////////////////////////////////
  /**
   * キーボード:コメントの表示を切り替える
   * @default ''
   */
  'kbd:toggleDisplayComment': string
  /**
   * キーボード:全体のオフセットを増やす
   * @default ''
   */
  'kbd:increaseGlobalOffset': string

  /**
   * キーボード:全体のオフセットを減らす
   * @default ''
   */
  'kbd:decreaseGlobalOffset': string

  /**
   * キーボード:全体のオフセットをリセットする
   * @default ''
   */
  'kbd:resetGlobalOffset': string

  /**
   * キーボード:オフセットを「ｷﾀ-」に飛ばす
   * @default ''
   */
  'kbd:jumpMarkerToStart': string

  /**
   * キーボード:オフセットを「OP」に飛ばす
   * @default ''
   */
  'kbd:jumpMarkerToOP': string

  /**
   * キーボード:オフセットを「A」に飛ばす
   * @default ''
   */
  'kbd:jumpMarkerToA': string

  /**
   * キーボード:オフセットを「B」に飛ばす
   * @default ''
   */
  'kbd:jumpMarkerToB': string

  /**
   * キーボード:オフセットを「ED」に飛ばす
   * @default ''
   */
  'kbd:jumpMarkerToED': string

  /**
   * キーボード:オフセットを「C」に飛ばす
   * @default ''
   */
  'kbd:jumpMarkerToC': string

  /**
   * キーボード:オフセットをリセットする
   * @default ''
   */
  'kbd:resetMarker': string

  // プラグイン //////////////////////////////////////////////////
  /**
   * プラグイン
   * @default []
   */
  plugins: PluginKey[]

  // 検索 //////////////////////////////////////////////////
  /**
   * 検索:ソート順
   * @default '-startTime'
   */
  'search:sort': SearchQuerySort

  /**
   * 検索:投稿日時
   * @default [null, null]
   */
  'search:dateRange': [
    start: DateTimeDuration | null,
    end: DateTimeDuration | null,
  ]

  /**
   * 検索:ジャンル
   * @default 'アニメ'
   */
  'search:genre': '未指定' | NiconicoGenre

  /**
   * 検索:再生時間
   * @default [null, null]
   */
  'search:lengthRange': [start: number | null, end: number | null]

  // コメントリスト //////////////////////////////////////////////////
  /**
   * スムーズなスクロール
   * @default false
   */
  'commentList:smoothScrolling': boolean

  /**
   * オフセット調節を表示
   * @default true
   */
  'commentList:showPositionControl': boolean
}

export type SettingStorageItems = {
  [K in keyof SettingItems as `settings:${K}`]: SettingItems[K]
}

export interface SettingsExportItems
  extends Partial<InternalItems & SettingStorageItems> {}

export interface TemporaryItems {
  /**
   * コメント:不透明度 (パネル用)
   * @default undefined
   */
  'tmp:comment:opacity': number
}

export interface StateItems extends NCOStateItems {}

export type StorageItems = InternalItems &
  SettingStorageItems &
  TemporaryItems &
  StateItems

export type InternalKey = keyof InternalItems
export type SettingsKey = keyof SettingItems
export type SettingsExportKey = keyof SettingsExportItems
export type TemporaryKey = keyof TemporaryItems
export type StateKey = keyof StateItems
export type StorageKey = keyof StorageItems
