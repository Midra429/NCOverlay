import type { Storage, Tabs } from 'wxt/browser'

import { browser } from 'wxt/browser'

declare module 'wxt/browser' {
  namespace Storage {
    interface StorageArea {
      /**
       * 1 つ以上のアイテムで使用されているスペースの量（バイト単位）を取得します。
       *
       * @param keys 合計使用量を取得する単一のキーまたはキーのリスト。\
       * リストが空の場合は 0 が返されます。\
       * `null` を渡して、すべての保存容量の合計使用量を取得します。
       * @returns ストレージで使用されている容量（バイト単位）。
       */
      getBytesInUse(keys?: string | string[] | null): Promise<number>
    }
  }

  interface AugmentedBrowser {
    isChrome: boolean
    isFirefox: boolean
    isSafari: boolean

    getCurrentActiveTab(): Promise<Tabs.Tab | null>
  }
}

browser.isChrome =
  import.meta.env.CHROME || import.meta.env.EDGE || import.meta.env.OPERA
browser.isFirefox = import.meta.env.FIREFOX
browser.isSafari = import.meta.env.SAFARI

browser.getCurrentActiveTab = async function () {
  const [tab] = await this.tabs.query({
    active: true,
    currentWindow: true,
  })
  return tab ?? null
}

if (browser.isFirefox) {
  browser.storage.local.getBytesInUse = async function (keys) {
    const values = await this.get(keys)

    let bytes = 0

    for (const [key, value] of Object.entries(values)) {
      bytes += key.length
      bytes +=
        typeof value === 'string' ? value.length : JSON.stringify(value).length
    }

    return bytes
  }
}

export const webext = browser
