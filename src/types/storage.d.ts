import type { VodKey, PluginKey } from '@/types/constants'
import type { NCOStateItems } from '@/ncoverlay/state'

export type NgSettingsContent = {
  content: string
  isRegExp?: boolean
}

export type NgSettings = {
  words: NgSettingsContent[]
  commands: NgSettingsContent[]
  ids: NgSettingsContent[]
}

/** < v3.10.0 */
export type StorageItems_v1 = {
  /**
   * コメント:自動読み込み
   * @default true
   */
  'settings:comment:autoLoad': boolean

  /**
   * コメント:自動読み込み:コメント専用動画を含める
   * @default false
   */
  'settings:comment:autoLoadSzbh': boolean

  /**
   * コメント:自動読み込み:dアニメストアのチャプター形式(分割)を含める
   * @default false
   */
  'settings:comment:autoLoadChapter': boolean

  /**
   * コメント:自動読み込み:ニコニコ実況(過去ログ)を含める
   * @default false
   */
  'settings:comment:autoLoadJikkyo': boolean

  /**
   * 実験的な機能:タイトル解析でAIを使用する
   * @default false
   */
  'settings:experimental:useAiParser': boolean
}

/** v3.10.0 <= */
export type StorageItems_v2 = {
  /**
   * テーマ
   * @default 'auto'
   */
  'settings:theme': 'auto' | 'light' | 'dark'

  /**
   * アップデート後に更新内容を表示
   * @default true
   */
  'settings:showChangelog': boolean

  /**
   * 動画配信サービス
   * @default []
   */
  'settings:vods': VodKey[]

  /**
   * キャプチャー:形式
   * @default 'jpeg'
   */
  'settings:capture:format': 'jpeg' | 'png'

  /**
   * キャプチャー:方式
   * @default 'jpeg'
   */
  'settings:capture:method': 'window' | 'copy'

  /**
   * コメント:自動読み込み
   * @default true
   */
  'settings:comment:autoLoads': ('normal' | 'szbh' | 'chapter' | 'jikkyo')[]

  /**
   * コメント:表示量
   * @description 1 ~ 5倍
   * @default 1
   */
  'settings:comment:amount': number

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
   * コメント:フレームレート
   * @description 30, 60, 0 (無制限)
   * @default 60
   */
  'settings:comment:fps': 30 | 60 | 0

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
   * キーボード:オフセットを「オープニング」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToOP': string

  /**
   * キーボード:オフセットを「Aパート」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToA': string

  /**
   * キーボード:オフセットを「Bパート」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToB': string

  /**
   * キーボード:オフセットを「Cパート」に飛ばす
   * @default ''
   */
  'settings:kbd:jumpMarkerToC': string

  /**
   * キーボード:オフセットをリセットする
   * @default ''
   */
  'settings:kbd:resetMarker': string

  /**
   * プラグイン
   * @default []
   */
  'settings:plugins': PluginKey[]
}

export type StorageItems = StorageItems_v2 & {
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
