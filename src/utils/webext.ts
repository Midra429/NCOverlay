import type { WebExtBrowser, SidePanel } from 'webextension-polyfill'

import { browser } from '@wxt-dev/webextension-polyfill/browser'

const webext = browser as WebExtBrowser
const manifest = webext.runtime.getManifest()

webext.isChrome =
  import.meta.env.CHROME || import.meta.env.EDGE || import.meta.env.OPERA
webext.isFirefox = import.meta.env.FIREFOX
webext.isSafari = import.meta.env.SAFARI

webext.getCurrentActiveTab = async function (windowId) {
  const tabId = new URL(location.href).searchParams.get(
    `_${EXT_BUILD_ID}_tabId`
  )

  const [tab] = tabId
    ? [await this.tabs.get(Number(tabId))]
    : await this.tabs.query({
        active: true,
        ...(typeof windowId === 'number' &&
        windowId !== this.windows.WINDOW_ID_NONE
          ? { windowId }
          : { currentWindow: true }),
      })

  if (typeof tab?.id === 'number' && tab.id !== this.tabs.TAB_ID_NONE) {
    return tab
  }

  return null
}

if (webext.action) {
  webext.action.getPopupPath = function (tabId) {
    return typeof tabId === 'number' && tabId !== webext.tabs.TAB_ID_NONE
      ? `${manifest.action?.default_popup}?_${EXT_BUILD_ID}_tabId=${tabId}`
      : manifest.action?.default_popup
  }
}

// Chrome
if (webext.isChrome) {
  if (webext.sidePanel) {
    webext.sidePanel.path = manifest.side_panel?.default_path

    webext.sidePanel.open = new Proxy(webext.sidePanel.open, {
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

    webext.sidePanel.close = function ({ tabId }) {
      return this.setOptions({ enabled: false, tabId })
    }
  }
}

// Firefox
if (webext.isFirefox) {
  webext.storage.local.getBytesInUse = async function (keys) {
    const values = await this.get(keys)

    return Object.entries(values).reduce((prev, [key, value]) => {
      const { size } = new Blob([
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ])

      return prev + size
    }, 0)
  }

  if (webext.sidebarAction) {
    webext.sidePanel = {
      path: manifest.sidebar_action?.default_panel,

      open() {
        return webext.sidebarAction.open()
      },

      close() {
        return webext.sidebarAction.close()
      },

      async getOptions(options) {
        const { tabId } = options ?? {}

        let isOpen = false

        if (typeof tabId === 'number') {
          const { windowId } = await webext.tabs.get(tabId)

          isOpen = await webext.sidebarAction.isOpen({ windowId })
        }

        const path = await webext.sidebarAction.getPanel({ tabId })
        const enabled = !!path && isOpen

        return { enabled, path, tabId }
      },

      async setOptions({ enabled, path, tabId }) {
        const currentPanel = await webext.sidebarAction.getPanel({ tabId })

        const panel =
          enabled === false ? null : path || currentPanel || this.path || null

        await webext.sidebarAction.setPanel({ panel, tabId })
      },
    }
  }
}

export { webext }
