import type { StorageItems, StorageKey } from '@/types/storage'

/**
 * ストレージのアイテムを取得
 */
export interface StorageGetFunction {
  /** すべてのアイテムを取得 */
  (): Promise<{
    [P in StorageKey]?: StorageItems[P]
  }>

  /** 1つのアイテムを取得 */
  <K extends StorageKey>(key: K): Promise<StorageItems[K] | null>

  /** 複数のアイテムを取得 */
  <K extends StorageKey[]>(
    ...keys: K
  ): Promise<{
    [P in keyof K]: StorageItems[K[P]] | null
  }>
}

/**
 * ストレージにアイテムを設定
 */
export interface StorageSetFunction {
  <K extends StorageKey>(
    key: K,
    value: StorageItems[K] | null | undefined
  ): Promise<void>
}

/**
 * ストレージからアイテムを削除
 */
export interface StorageRemoveFunction {
  /** すべてのアイテムを削除 */
  (): Promise<void>

  /** 複数のアイテムを削除 */
  (...keys: StorageKey[]): Promise<void>
}

/**
 * ストレージの使用量をバイト単位で取得
 */
export interface StorageGetBytesInUseFunction {
  /** 全体の使用量を取得 */
  (): Promise<number>

  /** 複数のアイテムの使用量を取得 */
  (...keys: StorageKey[]): Promise<number>
}

/** アイテムが変更されたときのコールバック */
export interface StorageOnChangeCallback<K extends StorageKey> {
  (newValue: StorageItems[K] | null, oldValue: StorageItems[K] | null): void
}

/**
 * ストレージのアイテムが変更
 */
export interface StorageOnChangeFunction {
  <K extends StorageKey>(
    key: K,
    callback: StorageOnChangeCallback<K>
  ): () => void
}

/**
 * ストレージの読み込み・監視のコールバック
 */
export interface StorageWatchCallback<K extends StorageKey> {
  (value: StorageItems[K] | null): void
}

/**
 * ストレージを読み込み、変更を監視する
 */
export interface StorageWatch {
  <K extends StorageKey>(key: K, callback: StorageWatchCallback<K>): () => void
}

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
