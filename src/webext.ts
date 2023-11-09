import type {
  WebExtMessageType,
  WebExtMessage,
  WebExtMessageResponse,
} from '@/types/webext/message'
import browser from 'webextension-polyfill'

declare module 'webextension-polyfill' {
  namespace Manifest {
    interface WebExtensionManifest {
      side_panel?: {
        default_path?: string
      }
    }
  }

  namespace Tabs {
    interface Static {
      sendMessage<T extends keyof WebExtMessageType>(
        tabId: number,
        message: WebExtMessage<T>,
        options?: Tabs.SendMessageOptionsType
      ): Promise<WebExtMessageResponse<T>>
    }
  }

  namespace Runtime {
    interface Static {
      sendMessage<T extends keyof WebExtMessageType>(
        message: WebExtMessage<T>,
        options?: Runtime.SendMessageOptionsType
      ): Promise<WebExtMessageResponse<T>>
    }
  }

  export var isChrome: boolean
  export var isFirefox: boolean

  export var sidePanel:
    | (typeof chrome.sidePanel & {
        open?(options: { windowId?: number }): void
      })
    | undefined
}

const extUrl = browser.runtime.getURL('/')

browser.isChrome = extUrl.startsWith('chrome-extension')
browser.isFirefox = extUrl.startsWith('moz-extension')

if (browser.isChrome) {
  browser.sidePanel = chrome.sidePanel
}

export default browser
