import type browser from 'webextension-polyfill'
import type { Browser } from 'wxt/browser'

import { browser as webext } from 'wxt/browser'

declare module 'wxt/browser' {
  namespace Browser {
    export namespace runtime {
      export interface ManifestSidePanel {
        default_path?: string
      }
      export interface ManifestSidebarAction {
        default_panel?: string
      }

      export interface ManifestV3 {
        side_panel?: ManifestSidePanel
        sidebar_action?: ManifestSidebarAction
      }

      export function getManifest(): ManifestV3
    }

    export namespace action {
      export var path: string | undefined

      /**
       * ポップアップを新しいウィンドウで開く
       * @param tabId リンクするタブのID
       */
      export function openPopout(
        createData: OpenPopoutCreateData
      ): Promise<windows.Window | undefined>
    }

    export namespace sidePanel {
      export var path: string | undefined

      export function open(options?: OpenOptions): Promise<void>

      export function close(options?: CloseOptions): Promise<void>

      /**
       * サイドパネルを新しいウィンドウで開く
       * @param tabId リンクするタブのID
       */
      export function openPopout(
        createData: OpenPopoutCreateData
      ): Promise<windows.Window | undefined>
    }

    export type OpenPopoutThisArg = typeof action | typeof sidePanel
    export type OpenPopout = OpenPopoutThisArg['openPopout']
    export type OpenPopoutCreateData = Omit<windows.CreateData, 'type' | 'url'>

    export var SEARCH_PARAM_TAB_ID: `_${string}_tabId`

    export var isChrome: boolean
    export var isFirefox: boolean
    export var isSafari: boolean

    export var inContentScript: boolean
    export var inBackground: boolean
    export var inPopup: boolean
    export var inSidePanel: boolean
    export var inPopupWindow: boolean

    export function getCurrentActiveTab(): Promise<tabs.Tab | undefined>

    export function getCurrentActiveTabId(): Promise<number | undefined>
  }
}

const manifest = webext.runtime.getManifest()

webext.SEARCH_PARAM_TAB_ID = `_${EXT_BUILD_ID}_tabId`

webext.isChrome =
  import.meta.env.CHROME || import.meta.env.EDGE || import.meta.env.OPERA
webext.isFirefox = import.meta.env.FIREFOX
webext.isSafari = import.meta.env.SAFARI

const { protocol, pathname, search } = location

const searchParamTabId = new URLSearchParams(search).get(
  webext.SEARCH_PARAM_TAB_ID
)

webext.inContentScript = /^https?:$/.test(protocol)
webext.inBackground =
  !webext.inContentScript &&
  (pathname === '/background.js' ||
    pathname === '/_generated_background_page.html')
webext.inPopup = !webext.inContentScript && pathname === '/popup.html'
webext.inSidePanel = !webext.inContentScript && pathname === '/sidepanel.html'
webext.inPopupWindow = !!searchParamTabId

webext.getCurrentActiveTab = async function () {
  const tabId = searchParamTabId
    ? Number(searchParamTabId)
    : webext.tabs.TAB_ID_NONE

  try {
    const [tab] =
      tabId !== webext.tabs.TAB_ID_NONE
        ? [await this.tabs.get(tabId)]
        : await this.tabs.query({
            active: true,
            currentWindow: true,
          })

    if (tab?.id != null && tab.id !== this.tabs.TAB_ID_NONE) {
      return tab
    }
  } catch {}
}

webext.getCurrentActiveTabId = async function () {
  const tab = await this.getCurrentActiveTab()

  return tab?.id
}

async function openPopout(
  this: Browser.OpenPopoutThisArg,
  { tabId, ...createData }: Browser.OpenPopoutCreateData
): ReturnType<Browser.OpenPopout> {
  if (tabId == null || tabId === webext.tabs.TAB_ID_NONE) {
    const tab = await webext.getCurrentActiveTab()

    tabId = tab?.id
  }

  const url =
    tabId != null && tabId !== webext.tabs.TAB_ID_NONE
      ? `${this.path}?${webext.SEARCH_PARAM_TAB_ID}=${tabId}`
      : this.path

  return webext.windows.create({
    ...createData,
    type: 'popup',
    url,
  })
}

if (webext.action) {
  webext.action.path = manifest.action?.default_popup

  webext.action.openPopout = openPopout
}

// Chrome
if (webext.isChrome) {
  if (webext.sidePanel) {
    webext.sidePanel.path = manifest.side_panel?.default_path

    webext.sidePanel.open = new Proxy(webext.sidePanel.open, {
      async apply(
        target,
        thisArg: typeof Browser.sidePanel,
        [options]: Parameters<typeof Browser.sidePanel.open>
      ) {
        if (options?.tabId == null) {
          const tabId = await webext.getCurrentActiveTabId()

          if (tabId != null) {
            if (options) {
              options.tabId = tabId
            } else {
              options = { tabId }
            }
          }
        }

        await thisArg.setOptions({
          enabled: true,
          path: webext.sidePanel.path,
          tabId: options?.tabId,
        })

        return Reflect.apply(target, thisArg, [options])
      },
    })

    webext.sidePanel.close = async function (options) {
      if (options?.tabId == null) {
        const tabId = await webext.getCurrentActiveTabId()

        if (tabId != null) {
          if (options) {
            options.tabId = tabId
          } else {
            options = { tabId }
          }
        }
      }

      return this.setOptions({
        enabled: false,
        tabId: options?.tabId,
      })
    }

    webext.sidePanel.openPopout = openPopout
  }
}

// Firefox
if (webext.isFirefox) {
  // @ts-ignore
  webext.storage.local.getBytesInUse = async function (keys: string) {
    const values = await this.get(keys)

    return Object.entries(values).reduce((prev, [key, value]) => {
      const { size } = new Blob([
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ])

      return prev + size
    }, 0)
  }

  if ('sidebarAction' in webext) {
    const { sidebarAction } = webext as unknown as browser.Browser

    enum Side {
      LEFT = 'left',
      RIGHT = 'right',
    }

    webext.sidePanel = {
      Side,

      path: manifest.sidebar_action?.default_panel,

      open() {
        return sidebarAction.open()
      },

      close() {
        return sidebarAction.close()
      },

      openPopout,

      async getOptions(options) {
        const { tabId } = options ?? {}

        let isOpen = false

        if (tabId != null) {
          const { windowId } = await webext.tabs.get(tabId)

          isOpen = await sidebarAction.isOpen({ windowId })
        }

        const path = this.path
        const enabled = !!path && isOpen

        return { enabled, path, tabId }
      },

      async setOptions({ enabled, path, tabId }) {
        const panel = enabled ? path || this.path || null : null

        await sidebarAction.setPanel({ panel, tabId })
      },

      async getPanelBehavior() {
        return {}
      },

      async setPanelBehavior() {},

      async getLayout() {
        return {
          side: this.Side.RIGHT,
        }
      },

      onOpened: {
        addListener() {},
        getRules() {},
        hasListener() {
          return false
        },
        removeRules() {},
        addRules() {},
        removeListener() {},
        hasListeners() {
          return false
        },
      },

      onClosed: {
        addListener() {},
        getRules() {},
        hasListener() {
          return false
        },
        removeRules() {},
        addRules() {},
        removeListener() {},
        hasListeners() {
          return false
        },
      },
    }
  }
}

export type { Browser }
export { webext }
