import type { Tabs } from 'wxt/browser'

import { browser } from 'wxt/browser'

declare module 'wxt/browser' {
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

export const webext = browser
