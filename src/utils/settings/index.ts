import type {
  SettingsKey,
  SettingItems,
  SettingsExportKey,
  SettingsExportItems,
} from '@/types/storage'
import type { StorageOnChangeCallback } from '@/utils/storage'

import {
  SETTINGS_DEFAULT,
  SETTINGS_DEFAULT_KEYS,
} from '@/constants/settings/default'

import { WebExtStorage } from '@/utils/storage'

const SETTINGS_EXPORT_KEYS = [
  '_migrate_version',
  ...SETTINGS_DEFAULT_KEYS,
] as SettingsExportKey[]

/**
 * 設定を取得
 */
export type SettingsGetFunction = {
  /** すべての設定を取得 */
  (): Promise<SettingItems>

  /** 1つの設定を取得 */
  <Key extends SettingsKey>(key: Key): Promise<SettingItems[Key]>

  /** 複数の設定を取得 */
  <Keys extends SettingsKey[]>(
    ...keys: Keys
  ): Promise<{
    [key in Keys[number]]: SettingItems[key]
  }>
}

/**
 * 設定を更新
 */
export type SettingsSetFunction = <Key extends SettingsKey>(
  key: Key,
  value: SettingItems[Key] | null | undefined
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
export type SettingsWatch = <Key extends SettingsKey>(
  key: Key,
  callback: (value: SettingItems[Key]) => void
) => () => void

/**
 * 設定をインポート
 */
export type SettingsImportFunction = {
  (values: string | SettingsExportItems): Promise<void>
}

/**
 * 設定をエクスポート
 */
export type SettingsExportFunction = {
  (): Promise<SettingsExportItems>
}

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
    ) as SettingItems

    return keys.length
      ? items
      : {
          ...SETTINGS_DEFAULT,
          ...items,
        }
  }

  readonly remove: SettingsRemoveFunction = (...keys: SettingsKey[]) => {
    if (!keys.length) {
      keys = SETTINGS_DEFAULT_KEYS
    }

    return this.#storage.remove(...keys)
  }

  readonly getBytesInUse: SettingsGetBytesInUseFunction = (
    ...keys: SettingsKey[]
  ) => {
    if (!keys.length) {
      keys = SETTINGS_DEFAULT_KEYS
    }

    return this.#storage.getBytesInUse(...keys)
  }

  readonly watch: SettingsWatch = (key, callback) => {
    let removeListener = () => {}

    this.get(key).then((value) => {
      callback(value)

      removeListener = this.onChange(key, (value) => {
        callback((value ?? SETTINGS_DEFAULT[key]) as any)
      })
    })

    return () => removeListener()
  }

  readonly import: SettingsImportFunction = async (values) => {
    const object =
      typeof values === 'string'
        ? (JSON.parse(values) as SettingsExportItems)
        : values

    const entries = (
      Object.entries(object) as [
        SettingsExportKey,
        SettingsExportItems[SettingsExportKey],
      ][]
    ).filter(([key]) => SETTINGS_EXPORT_KEYS.includes(key))

    await Promise.all(
      entries.map(([key, value]) => {
        return this.#storage.set(key, value)
      })
    )
  }

  readonly export: SettingsExportFunction = () => {
    return this.#storage.get(
      ...SETTINGS_EXPORT_KEYS
    ) as Promise<SettingsExportItems>
  }
}
