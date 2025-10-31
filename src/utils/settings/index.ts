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
export interface SettingsGetFunction {
  /** すべての設定を取得 */
  (): Promise<SettingItems>

  /** 1つの設定を取得 */
  <K extends SettingsKey>(key: K): Promise<SettingItems[K]>

  /** 複数の設定を取得 */
  <K extends SettingsKey[]>(
    ...keys: K
  ): Promise<{
    [P in keyof K]: SettingItems[K[P]]
  }>
}

/**
 * 設定を更新
 */
export interface SettingsSetFunction {
  <K extends SettingsKey>(
    key: K,
    value: SettingItems[K] | null | undefined
  ): Promise<void>
}

/**
 * 設定を削除
 */
export interface SettingsRemoveFunction {
  /** すべての設定を削除 */
  (): Promise<void>

  /** 複数の設定を削除 */
  (...keys: SettingsKey[]): Promise<void>
}

/**
 * 設定の使用量をバイト単位で取得
 */
export interface SettingsGetBytesInUseFunction {
  /** 全体の使用量を取得 */
  (): Promise<number>

  /** 複数の設定の使用量を取得 */
  (...keys: SettingsKey[]): Promise<number>
}

/**
 * 設定が変更
 */
export interface SettingsOnChangeFunction {
  <K extends SettingsKey>(
    key: K,
    callback: StorageOnChangeCallback<K>
  ): () => void
}

/**
 * 設定を読み込み、変更を監視する
 */
export interface SettingsWatch {
  <K extends SettingsKey>(
    key: K,
    callback: (value: SettingItems[K]) => void
  ): () => void
}

/**
 * 設定をインポート
 */
export interface SettingsImportFunction {
  (values: string | SettingsExportItems): Promise<void>
}

/**
 * 設定をエクスポート
 */
export interface SettingsExportFunction {
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
    if (!keys.length) {
      const values = await this.#storage.get()
      const items = Object.fromEntries(
        Object.entries(values).map(([key, val]) => {
          return [key, val ?? SETTINGS_DEFAULT[key as SettingsKey]]
        })
      )

      return { ...SETTINGS_DEFAULT, ...items }
    } else if (keys.length === 1) {
      const key = keys[0]
      const value = (await this.#storage.get(key)) as any

      return value ?? SETTINGS_DEFAULT[key]
    } else {
      const values = await this.#storage.get(...keys)

      return values.map((v, i) => v ?? SETTINGS_DEFAULT[keys[i]])
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
