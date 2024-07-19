import type { StorageItems, SettingsKey } from '@/types/storage'
import type { StorageOnChangeCallback } from '@/utils/storage'

import { SETTINGS_DEFAULT } from '@/constants'
import { WebExtStorage } from '@/utils/storage'

/**
 * 設定を取得
 */
export type SettingsGetFunction = {
  /** すべての設定を取得 */
  (): Promise<{
    [key in SettingsKey]: StorageItems[key]
  }>

  /** 1つの設定を取得 */
  <Key extends SettingsKey>(key: Key): Promise<StorageItems[Key]>

  /** 複数の設定を取得 */
  <Keys extends SettingsKey[]>(
    ...keys: Keys
  ): Promise<{
    [key in Keys[number]]: StorageItems[key]
  }>
}

/**
 * 設定を更新
 */
export type SettingsSetFunction = <Key extends SettingsKey>(
  key: Key,
  value: StorageItems[Key] | null | undefined
) => Promise<void>

/**
 * 設定を削除
 */
export type SettingsRemoveFunction = {
  /** すべての設定を削除 */
  (): Promise<void>

  /** 複数の設定を削除 */
  (...keys: SettingsKey[]): Promise<void>
}

/**
 * 設定の使用量をバイト単位で取得
 */
export type SettingsGetBytesInUseFunction = {
  /** 全体の使用量を取得 */
  (): Promise<number>

  /** 複数の設定の使用量を取得 */
  (...keys: SettingsKey[]): Promise<number>
}

/**
 * 設定が変更
 */
export type SettingsOnChangeFunction = <Key extends SettingsKey>(
  key: Key,
  callback: StorageOnChangeCallback<Key>
) => () => void

/**
 * 設定を読み込み、変更を監視する
 */
export type SettingsLoadAndWatch = <Key extends SettingsKey>(
  key: Key,
  callback: (value: StorageItems[Key]) => void
) => () => void

export class WebExtSettings {
  #storage: WebExtStorage

  constructor(storage: WebExtStorage) {
    this.#storage = storage
  }

  get set() {
    return this.#storage.set as SettingsSetFunction
  }

  get onChange() {
    return this.#storage.onChange as SettingsOnChangeFunction
  }

  readonly get: SettingsGetFunction = async (...keys: SettingsKey[]) => {
    const values = await this.#storage.get(...keys)

    if (keys.length === 1) {
      return (values ?? SETTINGS_DEFAULT[keys[0]]) as any
    }

    const items = Object.fromEntries(
      Object.entries(values).map(([key, val]) => {
        return [key, val ?? SETTINGS_DEFAULT[key as SettingsKey]]
      })
    ) as {
      [key in SettingsKey]: StorageItems[key]
    }

    return keys.length
      ? items
      : {
          ...SETTINGS_DEFAULT,
          ...items,
        }
  }

  readonly remove: SettingsRemoveFunction = (...keys: SettingsKey[]) => {
    if (!keys.length) {
      keys = Object.keys(SETTINGS_DEFAULT) as SettingsKey[]
    }

    return this.#storage.remove(...keys)
  }

  readonly getBytesInUse: SettingsGetBytesInUseFunction = (
    ...keys: SettingsKey[]
  ) => {
    if (!keys.length) {
      keys = Object.keys(SETTINGS_DEFAULT) as SettingsKey[]
    }

    return this.#storage.getBytesInUse(...keys)
  }

  readonly loadAndWatch: SettingsLoadAndWatch = (key, callback) => {
    let removeListener = () => {}

    this.get(key).then((value) => {
      callback(value)

      removeListener = this.onChange(key, (value) => {
        callback((value ?? SETTINGS_DEFAULT[key]) as any)
      })
    })

    return () => removeListener()
  }
}
