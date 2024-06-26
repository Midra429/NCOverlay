import type { VodKey, PluginKey } from '@/types/constants'
import type { NCOState, NCOStateJson } from '@/ncoverlay/state'
import type { NgSetting } from '@midra/nco-api/utils/applyNgSetting'

/** <= v2.x.x */
export type StorageItems_v0 = {
  /** 表示・非表示 */
  enable: boolean
  /** 不透明度 */
  opacity: number
  /** 低パフォーマンスモード */
  lowPerformance: boolean
  /** タイトルの一致判定を厳密にする */
  strictMatch: boolean
  /** コメント専用動画のコメントを表示 */
  szbhMethod: boolean
  /** ニコニコのNG設定を使用 */
  useNgList: boolean
  /** アップデート後に更新内容を表示 */
  showChangelog: boolean
}

export type StorageItems = {
  [k in NCOState['key']]?: NCOStateJson
} & {
  '_migrate_version': number

  /**
   * コメント:不透明度 (パネル用)
   * @default undefined
   */
  'tmp:comment:opacity': number

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
   * コメント:自動読み込み
   * @default true
   */
  'settings:comment:autoLoad': boolean

  /**
   * コメント:自動読み込み:dアニメストアのチャプター形式(分割)を含める
   * @default false
   */
  'settings:comment:autoLoadChapter': boolean

  /**
   * コメント:自動読み込み:コメント専用動画を含める
   * @default false
   */
  'settings:comment:autoLoadSzbh': boolean

  /**
   * コメント:自動読み込み:ニコニコ実況(過去ログ)を含める
   * @default false
   */
  'settings:comment:autoLoadJikkyo': boolean

  /**
   * コメント:NG設定を使用
   * @default false
   */
  'settings:comment:useNglist': boolean

  /**
   * コメント:表示量
   * @description 1 ~ 5倍
   * @default 1
   */
  'settings:comment:amount': number

  /**
   * コメント:表示サイズ
   * @description 50 ~ 100%
   * @default 100
   */
  'settings:comment:scale': number

  /**
   * コメント:不透明度
   * @description 0 ~ 100%
   * @default 100
   */
  'settings:comment:opacity': number

  /**
   * コメント:フレームレート
   * @description 30, 60, 0 (無制限)
   * @default 60
   */
  'settings:comment:fps': 30 | 60 | 0

  /**
   * NG設定:単語
   * @default []
   */
  'settings:ng:word': NgSetting['word']

  /**
   * NG設定:コマンド
   * @default []
   */
  'settings:ng:command': NgSetting['command']

  /**
   * NG設定:ユーザーID
   * @default []
   */
  'settings:ng:id': NgSetting['id']

  /**
   * プラグイン
   * @default []
   */
  'settings:plugins': PluginKey[]
}

export type StorageKey = keyof StorageItems

export type InternalKey = Extract<StorageKey, `_${string}`>

export type TemporaryKey = Extract<StorageKey, `tmp:${string}`>

export type SettingsKey = Extract<StorageKey, `settings:${string}`>
