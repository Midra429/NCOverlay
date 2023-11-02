export type WebExtStorageSettings = {
  /** 表示・非表示 */
  enable: boolean
  /** 不透明度 */
  opacity: number
  /** 低パフォーマンスモード */
  lowPerformance: boolean
  /** タイトルの一致判定を緩くする */
  weakMatch: boolean
  /** コメント専用動画を表示する */
  szbhMethod: boolean
  /** ニコニコのNG設定を使う */
  useNgList: boolean
  /** アップデート後に更新内容を表示する */
  showChangelog: boolean
}

export type WebExtStorage = WebExtStorageSettings

export type WebExtStorageChanges = Partial<{
  [key in keyof WebExtStorage]: {
    newValue?: WebExtStorage[key]
    oldValue?: WebExtStorage[key]
  }
}>
