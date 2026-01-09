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
  'settings:comment:autoLoads': ('normal' | 'szbh' | 'chapter' | 'jikkyo')[]
}

export interface StorageItems_v3 {
  /**
   * NG設定:ニコニコ側のNG設定を使用
   * @default false
   */
  'settings:ng:useNiconicoAccount': boolean
}

export interface StorageItems_v4 {
  /**
   * 自動検索:検索対象
   * @default true
   */
  'settings:comment:autoLoads': AutoSearchTarget[]

  /**
   * 自動検索:実況チャンネル
   * @default []
   */
  'settings:comment:jikkyoChannelIds': JikkyoChannelId[]
}

export interface SettingItems {
  // 全般 //////////////////////////////////////////////////
  /**
   * テーマ
   * @default 'auto'
   */
  'settings:theme': 'auto' | 'light' | 'dark'

  /**
   * 動画配信サービス
   * @default []
   */
  'settings:vods': VodKey[]

  /**
   * キャプチャ: 形式
   * @default 'jpeg'
   */
  'settings:capture:format': 'jpeg' | 'png'

  /**
   * キャプチャ: 方式
   * @default 'jpeg'
   */
  'settings:capture:method': 'window' | 'copy'

  /**
   * 更新内容を表示
   * @default true
   */
  'settings:showChangelog': boolean

  /**
   * かわいい率を表示
   * @default false
   */
  'settings:showKawaiiPct': boolean

  // コメント //////////////////////////////////////////////////
  /**
   * コメント:フレームレート
   * @description 30, 60, 0 (無制限)
   * @default 60
   */
  'settings:comment:fps': 30 | 60 | 0

  /**
   * コメント:不透明度
   * @description 0 ~ 100%
   * @default 100
   */
  'settings:comment:opacity': number

  /**
   * コメント:表示サイズ
   * @description 50 ~ 100%
   * @default 100
   */
  'settings:comment:scale': number

  /**
   * コメント:速度
   * @description 0.25 〜 x2
   * @default 1
   */
  'settings:comment:speed': number

  /**
   * コメント:カスタマイズ
   */
  'settings:comment:customize': CommentCustomize

  /**
   * コメント:表示量
   * @description 1 ~ 10倍
   * @default 1
   */
  'settings:comment:amount': number

  /**
   * コメント:ニコニコのログイン情報を使用
   * @default true
   */
  'settings:comment:useNiconicoCredentials': boolean

  /**
   * コメント:コメントアシストの表示を抑制
   * @default false
   */
  'settings:comment:hideAssistedComments': boolean

  /**
   * コメント:実況: オフセット自動調節
   * @default false
   */
  'settings:comment:adjustJikkyoOffset': boolean

  // 自動検索 //////////////////////////////////////////////////
  /**
   * 自動検索:検索対象
   * @default ['official', 'danime', 'chapter']
   */
  'settings:autoSearch:targets': AutoSearchTarget[]

  /**
   * 自動検索:実況: チャンネル
   * @default Object.keys(JIKKYO_CHANNELS)
   */
  'settings:autoSearch:jikkyoChannelIds': JikkyoChannelId[]

  /**
   * 自動検索:実況: オフセット自動調節可のみ
   * @default false
   */
  'settings:autoSearch:jikkyoOnlyAdjustable': boolean

  /**
   * 自動検索:手動で実行
   * @default false
   */
  'settings:autoSearch:manual': boolean

  // NG設定 //////////////////////////////////////////////////
  /**
   * NG設定:コメント
   * @default []
   */
  'settings:ng:words': NgSettings['words']

  /**
   * NG設定:コマンド
   * @default []
   */
  'settings:ng:commands': NgSettings['commands']

  /**
   * NG設定:ユーザーID
   * @default []
   */
  'settings:ng:ids': NgSettings['ids']

  /**
   * NG設定:サイズの大きいコメントを非表示
   * @default false
   */
  'settings:ng:largeComments': boolean

  /**
   * NG設定:固定コメントを非表示
   * @default false
   */
  'settings:ng:fixedComments': boolean

  /**
   * NG設定:色付きコメントを非表示
   * @default false
   */
  'settings:ng:coloredComments': boolean

  /**
   * NG設定:NG共有レベル
   * @default 'none'
   */
  'settings:ng:sharingLevel': NgSharingLevel

  // キーボード //////////////////////////////////////////////////
  /**
   * キーボード:コメントの表示を切り替える
   * @default ''
   */
  'settings:kbd:toggleDisplayComment': string
  /**
   * キーボード:全体のオフセットを増やす
   * @default ''
   */
  'settings:kbd:increaseGlobalOffset': string

  /**
   * キーボード:全体のオフセットを減らす
   * @default ''
   */
  'settings:kbd:decreaseGlobalOffset': string

  /**
   * キーボード:全体のオフセットをリセットする
   * @default ''
   */
  'settings:kbd:resetGlobalOffset': string

  /**
   * キーボード:オフセットを「ｷﾀ-」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToStart': string

  /**
   * キーボード:オフセットを「OP」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToOP': string

  /**
   * キーボード:オフセットを「A」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToA': string

  /**
   * キーボード:オフセットを「B」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToB': string

  /**
   * キーボード:オフセットを「ED」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToED': string

  /**
   * キーボード:オフセットを「C」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToC': string

  /**
   * キーボード:オフセットをリセットする
   * @default ''
   */
  'settings:kbd:resetMarker': string

  // プラグイン //////////////////////////////////////////////////
  /**
   * プラグイン
   * @default []
   */
  'settings:plugins': PluginKey[]

  // 検索 //////////////////////////////////////////////////
  /**
   * 検索:ソート順
   * @default '-startTime'
   */
  'settings:search:sort': SearchQuerySort

  /**
   * 検索:投稿日時
   * @default [null, null]
   */
  'settings:search:dateRange': [
    start: DateTimeDuration | null,
    end: DateTimeDuration | null,
  ]

  /**
   * 検索:ジャンル
   * @default 'アニメ'
   */
  'settings:search:genre': '未指定' | NiconicoGenre

  /**
   * 検索:再生時間
   * @default [null, null]
   */
  'settings:search:lengthRange': [start: number | null, end: number | null]

  // コメントリスト //////////////////////////////////////////////////
  /**
   * スムーズなスクロール
   * @default false
   */
  'settings:commentList:smoothScrolling': boolean

  /**
   * オフセット調節を表示
   * @default true
   */
  'settings:commentList:showPositionControl': boolean
}

export interface SettingsExportItems
  extends Partial<InternalItems & SettingItems> {}

export interface TemporaryItems {
  /**
   * コメント:不透明度 (パネル用)
   * @default undefined
   */
  'tmp:comment:opacity': number
}

export interface StateItems extends NCOStateItems {}

export type StorageItems = InternalItems &
  SettingItems &
  TemporaryItems &
  StateItems

export type InternalKey = keyof InternalItems
export type SettingsKey = keyof SettingItems
export type SettingsExportKey = keyof SettingsExportItems
export type TemporaryKey = keyof TemporaryItems
export type StateKey = keyof StateItems
export type StorageKey = keyof StorageItems
