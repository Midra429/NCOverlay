import type {
  WebExtMessage,
  WebExtMessageBody,
  WebExtResponse,
} from '@/types/webext/message'
import browser from 'webextension-polyfill'

declare module 'webextension-polyfill' {
  namespace Tabs {
    interface Static {
      sendMessage<T extends keyof WebExtMessageBody>(
        tabId: number,
        message: WebExtMessage<T>,
        options?: Tabs.SendMessageOptionsType
      ): Promise<WebExtResponse<T>>
    }
  }

  namespace Runtime {
    interface Static {
      sendMessage<T extends keyof WebExtMessageBody>(
        message: WebExtMessage<T>,
        options?: Runtime.SendMessageOptionsType
      ): Promise<any>
    }
  }

  namespace Manifest {
    interface WebExtensionManifest {
      side_panel?: {
        default_path?: string
      }
    }
  }

  export var isChrome: boolean
  export var isFirefox: boolean

  export var sidePanel: typeof chrome.sidePanel & {
    open?(options: { windowId?: number }): void
  }
}

const extUrl = browser.runtime.getURL('/')

browser.isChrome = extUrl.startsWith('chrome-extension')
browser.isFirefox = extUrl.startsWith('moz-extension')

if (browser.isChrome) {
  browser.sidePanel = chrome.sidePanel
}

export default browser
