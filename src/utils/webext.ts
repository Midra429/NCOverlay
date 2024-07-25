import type { SidePanel } from 'wxt/browser'

import { browser } from 'wxt/browser'

browser.isChrome =
  import.meta.env.CHROME || import.meta.env.EDGE || import.meta.env.OPERA
browser.isFirefox = import.meta.env.FIREFOX
browser.isSafari = import.meta.env.SAFARI

browser.getCurrentActiveTab = async function (windowId) {
  const [tab] = await this.tabs.query({
    active: true,
    ...(typeof windowId === 'number' && windowId !== this.windows.WINDOW_ID_NONE
      ? { windowId }
      : { currentWindow: true }),
  })

  if (typeof tab?.id === 'number' && tab.id !== this.tabs.TAB_ID_NONE) {
    return tab as any
  }

  return null
}

// Chrome
if (browser.isChrome) {
  if (browser.sidePanel) {
    browser.sidePanel.open = new Proxy(browser.sidePanel.open, {
      apply(
        target,
        thisArg: SidePanel.Static,
        argArray: Parameters<SidePanel.Static['open']>
      ) {
        thisArg.setOptions({
          enabled: true,
          path: webext.sidePanel.path,
          tabId: argArray[0].tabId,
        })

        return Reflect.apply(target, thisArg, argArray)
      },
    })

    browser.sidePanel.close = function ({ tabId }) {
      return this.setOptions({ enabled: false, tabId })
    }
  }
}

// Firefox
if (browser.isFirefox) {
  browser.storage.local.getBytesInUse = async function (keys) {
    const values = await this.get(keys)

    let bytes = 0

    Object.entries(values).forEach(([key, value]) => {
      bytes += new Blob([
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]).size
    })

    return bytes
  }

  if (browser.sidebarAction) {
    browser.sidePanel = {
      open() {
        return browser.sidebarAction.open()
      },

      close() {
        return browser.sidebarAction.close()
      },

      async getOptions(options) {
        const { tabId } = options ?? {}

        let isOpen = false

        if (typeof tabId === 'number') {
          const { windowId } = await browser.tabs.get(tabId)

          isOpen = await browser.sidebarAction.isOpen({ windowId })
        }

        const path = await browser.sidebarAction.getPanel({ tabId })
        const enabled = !!path && isOpen

        return { enabled, path, tabId }
      },

      async setOptions({ enabled, path, tabId }) {
        const currentPanel = await browser.sidebarAction.getPanel({ tabId })

        const panel =
          enabled === false ? null : path || currentPanel || this.path || null

        await browser.sidebarAction.setPanel({ panel, tabId })
      },
    }
  }
}

if (browser.sidePanel) {
  const { side_panel, sidebar_action } = browser.runtime.getManifest()

  browser.sidePanel.path =
    side_panel?.default_path ?? sidebar_action?.default_panel
}

export const webext = browser
