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
       * ポップアップをポップアップウィンドウで開く
       * @param tabId リンクするタブのID
       */
      export function openPopupWindow(
        createData: OpenPopupWindowCreateData
      ): Promise<windows.Window | undefined>
    }

    export namespace sidePanel {
      export type CloseOptions = {
        tabId?: number
        windowId?: number
      } & (
        | {
            tabId: number
          }
        | {
            windowId: number
          }
      )

      export var path: string | undefined

      export function open(options?: OpenOptions): Promise<void>

      export function close(options?: CloseOptions): Promise<void>

      /**
       * サイドパネルをポップアップウィンドウで開く
       * @param tabId リンクするタブのID
       */
      export function openPopupWindow(
        createData: OpenPopupWindowCreateData
      ): Promise<windows.Window | undefined>
    }

    export type OpenPopupWindowThisArg = typeof action | typeof sidePanel
    export type OpenPopupWindow = OpenPopupWindowThisArg['openPopupWindow']
    export type OpenPopupWindowCreateData = Omit<
      windows.CreateData,
      'type' | 'url'
    >

    export var SEARCH_PARAM_TAB_ID: `_${string}_tabId`

    export var isChrome: boolean
    export var isFirefox: boolean
    export var isSafari: boolean

    export var isContentScript: boolean
    export var isBackground: boolean
    export var isPopup: boolean
    export var isSidePanel: boolean
    export var isPopupWindow: boolean

    export function getCurrentActiveTab(
      windowId?: number
    ): Promise<tabs.Tab | null>
  }
}

const manifest = webext.runtime.getManifest()

webext.SEARCH_PARAM_TAB_ID = `_${EXT_BUILD_ID}_tabId`

webext.isChrome =
  import.meta.env.CHROME || import.meta.env.EDGE || import.meta.env.OPERA
webext.isFirefox = import.meta.env.FIREFOX
webext.isSafari = import.meta.env.SAFARI

const { protocol, pathname, search } = location

webext.isContentScript = /^https?:$/.test(protocol)
webext.isBackground =
  !webext.isContentScript &&
  (pathname === '/background.js' ||
    pathname === '/_generated_background_page.html')
webext.isPopup = !webext.isContentScript && pathname === '/popup.html'
webext.isSidePanel = !webext.isContentScript && pathname === '/sidepanel.html'
webext.isPopupWindow = new URLSearchParams(search).has(
  webext.SEARCH_PARAM_TAB_ID
)

webext.getCurrentActiveTab = async function (windowId) {
  const tabId = new URL(location.href).searchParams.get(
    webext.SEARCH_PARAM_TAB_ID
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

async function openPopupWindow(
  this: Browser.OpenPopupWindowThisArg,
  { tabId, ...createData }: Browser.OpenPopupWindowCreateData
): ReturnType<Browser.OpenPopupWindow> {
  if (typeof tabId !== 'number' || tabId === webext.tabs.TAB_ID_NONE) {
    const tab = await webext.getCurrentActiveTab()

    tabId = tab?.id
  }

  const url =
    typeof tabId === 'number' && tabId !== webext.tabs.TAB_ID_NONE
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

  webext.action.openPopupWindow = openPopupWindow
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
        if (typeof options?.tabId !== 'number') {
          const tab = await webext.getCurrentActiveTab()

          if (typeof tab?.id === 'number') {
            if (options) {
              options.tabId = tab.id
            } else {
              options = { tabId: tab.id }
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
      if (typeof options?.tabId !== 'number') {
        const tab = await webext.getCurrentActiveTab()

        if (typeof tab?.id === 'number') {
          if (options) {
            options.tabId = tab.id
          } else {
            options = { tabId: tab.id }
          }
        }
      }

      return this.setOptions({
        enabled: false,
        tabId: options?.tabId,
      })
    }

    webext.sidePanel.openPopupWindow = openPopupWindow
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

    webext.sidePanel = {
      path: manifest.sidebar_action?.default_panel,

      open() {
        return sidebarAction.open()
      },

      close() {
        return sidebarAction.close()
      },

      openPopupWindow,

      async getOptions(options) {
        const { tabId } = options ?? {}

        let isOpen = false

        if (typeof tabId === 'number') {
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

      async setPanelBehavior(_behavior) {},
    }
  }
}

export type { Browser }
export { webext }
