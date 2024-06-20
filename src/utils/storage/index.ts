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
 * ストレージのアイテムが変更
 */
export type StorageOnChangeFunction = <Key extends StorageKey>(
  key: Key,
  callback: StorageOnChangeCallback<Key>
) => StorageOnChangeRemoveListener

/** アイテムが変更されたときのコールバック */
export type StorageOnChangeCallback<Key extends StorageKey> = (
  newValue: StorageItems[Key] | null,
  oldValue: StorageItems[Key] | null
) => void

/** ストレージのアイテム変更のイベントを削除 */
export type StorageOnChangeRemoveListener = () => void

/**
 * ストレージを読み込み、変更を監視する
 */
export type StorageLoadAndWatch = <Key extends StorageKey>(
  key: Key,
  callback: (value: StorageItems[Key] | null) => void
) => StorageOnChangeRemoveListener

export class WebExtStorage<
  OnChange extends
    StorageOnChangeFunction | null = StorageOnChangeFunction | null,
  LoadAndWatch extends StorageLoadAndWatch | null = StorageLoadAndWatch | null,
> {
  readonly get: StorageGetFunction
  readonly set: StorageSetFunction
  readonly remove: StorageRemoveFunction
  readonly onChange: OnChange
  readonly loadAndWatch: LoadAndWatch

  constructor(init: {
    get: StorageGetFunction
    set: StorageSetFunction
    remove: StorageRemoveFunction
    onChange: OnChange
    loadAndWatch: LoadAndWatch
  }) {
    this.get = init.get
    this.set = init.set
    this.remove = init.remove
    this.onChange = init.onChange
    this.loadAndWatch = init.loadAndWatch
  }
}
