import 'wxt/browser'

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
      export function getPopupPath(tabId?: number): string | undefined
    }

    export namespace sidePanel {
      export interface CloseOptions {
        tabId?: number
        windowId?: number
      }

      export function close(options: CloseOptions): Promise<void>

      export var path: string | undefined
    }

    export var SEARCH_PARAM_TAB_ID: `_${string}_tabId`

    export var isChrome: boolean
    export var isFirefox: boolean
    export var isSafari: boolean

    export var isBackground: boolean
    export var isPopup: boolean
    export var isSidePanel: boolean
    export var isContentScript: boolean

    export function getCurrentActiveTab(
      windowId?: number
    ): Promise<tabs.Tab | null>
  }
}
