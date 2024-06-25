import type { StorageItems, SettingsKey } from '@/types/storage'
import type {
  StorageOnChangeCallback,
  StorageOnChangeRemoveListener,
} from '@/utils/storage'

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
) => StorageOnChangeRemoveListener

export class WebExtSettings<
  Storage extends WebExtStorage,
  OnChange extends Storage['onChange'] extends null
    ? null
    : SettingsOnChangeFunction,
> {
  #storage: Storage

  constructor(storage: Storage) {
    this.#storage = storage
  }

  get set() {
    return this.#storage.set as SettingsSetFunction
  }

  get onChange() {
    return this.#storage.onChange as OnChange
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

  readonly remove: SettingsRemoveFunction = async (...keys: SettingsKey[]) => {
    if (!keys.length) {
      const values = await this.#storage.get()

      keys = Object.keys(values).filter((key) =>
        key.startsWith('settings:')
      ) as SettingsKey[]
    }

    return this.#storage.remove(...keys)
  }

  readonly getBytesInUse: SettingsGetBytesInUseFunction = async (
    ...keys: SettingsKey[]
  ) => {
    if (!keys.length) {
      const values = await this.#storage.get()

      keys = Object.keys(values).filter((key) =>
        key.startsWith('settings:')
      ) as SettingsKey[]
    }

    return this.#storage.getBytesInUse(...keys)
  }

  readonly loadAndWatch = <
    Key extends SettingsKey,
    Return extends OnChange extends null ? null : StorageOnChangeRemoveListener,
  >(
    key: Key,
    callback: (value: StorageItems[Key]) => void
  ): Return => {
    if (!this.onChange) {
      return null as Return
    }

    this.get(key).then(callback)

    return this.onChange(key, (value) => {
      callback(value ?? (SETTINGS_DEFAULT[key] as StorageItems[Key]))
    }) as Return
  }
}
