import type { WebExtBrowser, SidePanel } from 'webextension-polyfill'

import { browser } from '@wxt-dev/webextension-polyfill/browser'

const webext = browser as WebExtBrowser

webext.isChrome =
  import.meta.env.CHROME || import.meta.env.EDGE || import.meta.env.OPERA
webext.isFirefox = import.meta.env.FIREFOX
webext.isSafari = import.meta.env.SAFARI

webext.getCurrentActiveTab = async function (windowId) {
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
if (webext.isChrome) {
  if (webext.sidePanel) {
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

    let bytes = 0

    Object.entries(values).forEach(([key, value]) => {
      bytes += new Blob([
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]).size
    })

    return bytes
  }

  if (webext.sidebarAction) {
    webext.sidePanel = {
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

if (webext.sidePanel) {
  const { side_panel, sidebar_action } = webext.runtime.getManifest()

  webext.sidePanel.path =
    side_panel?.default_path ?? sidebar_action?.default_panel
}

export { webext }
