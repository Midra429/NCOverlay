import type { DateTimeDuration } from '@internationalized/date'
import type {
  NiconicoGenre,
  JikkyoChannelId,
} from '@midra/nco-utils/types/api/constants'
import type { SearchQuerySort } from '@midra/nco-utils/types/api/niconico/search'
import type { VodKey, PluginKey } from '@/types/constants'
import type { NCOStateItems } from '@/ncoverlay/state'

export interface NgSettingsContent {
  content: string
  isRegExp?: boolean
}

export interface NgSettings {
  words: NgSettingsContent[]
  commands: NgSettingsContent[]
  ids: NgSettingsContent[]
}

/** < v3.13.1 */
export interface StorageItems_v2 {
  /**
   * コメント:自動検索
   * @default true
   */
  'settings:comment:autoLoads': ('normal' | 'szbh' | 'chapter' | 'jikkyo')[]
}

/** v3.13.1 <= */
export interface StorageItems_v3 {
  /**
   * NG設定:ニコニコ側のNG設定を使用
   * @default false
   */
  'settings:ng:useNiconicoAccount': boolean
}

export interface StorageItems_v4 {
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
   * コメント:表示量
   * @description 1 ~ 10倍
   * @default 1
   */
  'settings:comment:amount': number

  /**
   * コメント:自動検索
   * @default true
   */
  'settings:comment:autoLoads': (
    | 'official'
    | 'danime'
    | 'chapter'
    | 'szbh'
    | 'jikkyo'
  )[]

  /**
   * コメント:ニコニコのログイン情報を使用
   * @default true
   */
  'settings:comment:useNiconicoCredentials': boolean

  /**
   * コメント:実況チャンネル
   * @default []
   */
  'settings:comment:jikkyoChannelIds': JikkyoChannelId[]

  /**
   * コメント:コメントアシストを非表示
   * @default false
   */
  'settings:comment:hideAssistedComments': boolean

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

  // キーボード //////////////////////////////////////////////////
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
}

export type StorageItems = StorageItems_v4 & {
  '_migrate_version': number

  /**
   * コメント:不透明度 (パネル用)
   * @default undefined
   */
  'tmp:comment:opacity': number
} & NCOStateItems

export type StorageKey = keyof StorageItems

export type InternalKey = Extract<StorageKey, `_${string}`>
export type InternalItems = { [k in InternalKey]: StorageItems[k] }

export type TemporaryKey = Extract<StorageKey, `tmp:${string}`>
export type TemporaryItems = { [k in TemporaryKey]: StorageItems[k] }

export type SettingsKey = Extract<StorageKey, `settings:${string}`>
export type SettingItems = { [k in SettingsKey]: StorageItems[k] }

export type StateKey = Extract<StorageKey, `state:${string}`>
export type StateItems = { [k in StateKey]: StorageItems[k] }

export type SettingsExportKey = InternalKey | SettingsKey
export type SettingsExportItems = Partial<InternalItems & SettingItems>
