import type { StorageItems, StorageKey } from '@/types/storage'

/**
 * ストレージのアイテムを取得
 */
export type StorageGetFunction = {
  /** すべてのアイテムを取得 */
  (): Promise<{
    [key in StorageKey]?: StorageItems[key]
  }>

  /** 1つのアイテムを取得 */
  <Key extends StorageKey>(key: Key): Promise<StorageItems[Key] | null>

  /** 複数のアイテムを取得 */
  <Keys extends StorageKey[]>(
    ...keys: Keys
  ): Promise<{
    [key in Keys[number]]: StorageItems[key] | null
  }>
}

/**
 * ストレージにアイテムを設定
 */
export type StorageSetFunction = <Key extends StorageKey>(
  key: Key,
  value: StorageItems[Key] | null | undefined
) => Promise<void>

/**
 * ストレージからアイテムを削除
 */
export type StorageRemoveFunction = {
  /** すべてのアイテムを削除 */
  (): Promise<void>

  /** 複数のアイテムを削除 */
  (...keys: StorageKey[]): Promise<void>
}

/**
 * ストレージの使用量をバイト単位で取得
 */
export type StorageGetBytesInUseFunction = {
  /** 全体の使用量を取得 */
  (): Promise<number>

  /** 複数のアイテムの使用量を取得 */
  (...keys: StorageKey[]): Promise<number>
}

/** アイテムが変更されたときのコールバック */
export type StorageOnChangeCallback<Key extends StorageKey> = (
  newValue: StorageItems[Key] | null,
  oldValue: StorageItems[Key] | null
) => void

/**
 * ストレージのアイテムが変更
 */
export type StorageOnChangeFunction = <Key extends StorageKey>(
  key: Key,
  callback: StorageOnChangeCallback<Key>
) => () => void

/**
 * ストレージの読み込み・監視のコールバック
 */
export type StorageWatchCallback<Key extends StorageKey> = (
  value: StorageItems[Key] | null
) => void

/**
 * ストレージを読み込み、変更を監視する
 */
export type StorageWatch = <Key extends StorageKey>(
  key: Key,
  callback: StorageWatchCallback<Key>
) => () => void

export class WebExtStorage {
  readonly get: StorageGetFunction
  readonly set: StorageSetFunction
  readonly remove: StorageRemoveFunction
  readonly getBytesInUse: StorageGetBytesInUseFunction
  readonly onChange: StorageOnChangeFunction
  readonly watch: StorageWatch

  constructor(methods: {
    get: StorageGetFunction
    set: StorageSetFunction
    remove: StorageRemoveFunction
    getBytesInUse: StorageGetBytesInUseFunction
    onChange: StorageOnChangeFunction
    watch: StorageWatch
  }) {
    this.get = methods.get
    this.set = methods.set
    this.remove = methods.remove
    this.getBytesInUse = methods.getBytesInUse
    this.onChange = methods.onChange
    this.watch = methods.watch
  }
}
