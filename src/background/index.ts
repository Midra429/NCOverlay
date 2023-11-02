import type { WebExtMessage, WebExtResponse } from '@/types/webext/message'
import { WebExtMessageTypeCheck } from '@/types/webext/message'
import {
  ACTION_ICONS_ENABLE,
  ACTION_ICONS_DISABLE,
  GITHUB_URL,
} from '@/constants'
import webext from '@/webext'
import { WebExtStorageApi } from '@/utils/webext/storage'
import { getSupportStatus } from '@/utils/webext/getSupportStatus'
import { getCurrentTab } from '@/utils/webext/getCurrentTab'
import { NiconicoApi } from './api/niconico'

console.log('[NCOverlay] background.js')

const manifest = webext.runtime.getManifest()

const setContextMenu = (id: string | number, enabled: boolean) => {
  webext.contextMenus.update(id, { enabled })
}

const setSidePanel = (tabId: number, enabled: boolean) => {
  // Chrome
  if (webext.isChrome) {
    return webext.sidePanel.setOptions({
      tabId,
      enabled,
      path: manifest.side_panel!.default_path,
    })
  }
  // Firefox
  // else if (webext.isFirefox) {
  //   return webext.sidebarAction.setPanel({
  //     tabId,
  //     panel: enabled ? manifest.sidebar_action!.default_panel : null,
  //   })
  // }
}

webext.action.disable()
webext.action.setIcon({ path: ACTION_ICONS_DISABLE })
webext.action.setBadgeBackgroundColor({ color: '#2389FF' })
webext.action.setBadgeTextColor({ color: '#FFF' })

webext.contextMenus.removeAll().then(() => {
  webext.contextMenus.create({
    id: 'ncoverlay:capture',
    title: 'スクリーンショット',
    contexts: ['action'],
    enabled: false,
  })
})

webext.contextMenus.onClicked.addListener(async ({ menuItemId }, tab) => {
  if (typeof tab?.id === 'undefined') return

  const { capture } = await getSupportStatus(tab.id)

  if (menuItemId === 'ncoverlay:capture' && capture) {
    await webext.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => document.dispatchEvent(new Event('ncoverlay:capture')),
    })
  }
})

webext.runtime.onInstalled.addListener(async (details) => {
  const { version } = manifest
  const settings = await WebExtStorageApi.getSettings()

  if (details.reason === 'install') {
    webext.tabs.create({ url: `${GITHUB_URL}/blob/v${version}/README.md` })
  }

  if (details.reason === 'update' && settings.showChangelog) {
    webext.tabs.create({ url: `${GITHUB_URL}/releases/tag/v${version}` })
  }
})

webext.runtime.onMessage.addListener(
  (
    message: WebExtMessage,
    sender,
    sendResponse: (response: WebExtResponse) => void
  ) => {
    let promise: Promise<any> | null = null

    // ニコニコ 検索
    if (WebExtMessageTypeCheck['niconico:search'](message)) {
      promise = NiconicoApi.search(message.body.query)
    }

    // ニコニコ 動画情報
    if (WebExtMessageTypeCheck['niconico:video'](message)) {
      promise = NiconicoApi.video(message.body.videoId, message.body.guest)
    }

    // ニコニコ コメント
    if (WebExtMessageTypeCheck['niconico:threads'](message)) {
      promise = NiconicoApi.threads(message.body.nvComment)
    }

    // 拡張機能 アクション 有効/無効
    if (WebExtMessageTypeCheck['webext:action'](message)) {
      if (message.body) {
        webext.action.enable(sender.tab?.id)
      } else {
        webext.action.disable(sender.tab?.id)
      }

      webext.action.setIcon({
        tabId: sender.tab?.id,
        path: message.body ? ACTION_ICONS_ENABLE : ACTION_ICONS_DISABLE,
      })
    }

    // 拡張機能 アクション バッジ
    if (WebExtMessageTypeCheck['webext:action:badge'](message)) {
      webext.action.setBadgeText({
        tabId: sender.tab?.id,
        text: message.body.toString(),
      })
    }

    // 拡張機能 アクション タイトル (ツールチップ)
    if (WebExtMessageTypeCheck['webext:action:title'](message)) {
      webext.action.setTitle({
        tabId: sender.tab?.id,
        title: message.body,
      })
    }

    // 拡張機能 サイドパネル 有効/無効
    if (WebExtMessageTypeCheck['webext:side_panel'](message)) {
      // Chrome
      if (webext.isChrome) {
        webext.sidePanel.setOptions({
          tabId: sender.tab?.id,
          enabled: message.body,
        })
      }
      // Firefox
      // else if (webext.isFirefox) {
      //   webext.sidebarAction.setPanel({
      //     tabId: sender.tab?.id,
      //     panel: message.body ? manifest.sidebar_action!.default_panel : null,
      //   })
      // }
    }

    if (promise) {
      promise
        .then((result) => {
          sendResponse({
            type: message.type,
            result: result,
          })
        })
        .catch((e) => {
          console.log('[NCOverlay] Error', e)

          sendResponse({
            type: message.type,
            result: null,
          })
        })

      return true
    }
  }
)

// ウィンドウ変更時
webext.windows.onFocusChanged.addListener(async (windowId) => {
  const tab = await getCurrentTab(windowId)
  const { capture } = await getSupportStatus(tab?.id)

  setContextMenu('ncoverlay:capture', capture)
})

// タブ変更時
webext.tabs.onActivated.addListener(async ({ tabId }) => {
  const { vod, capture } = await getSupportStatus(tabId)

  setContextMenu('ncoverlay:capture', capture)

  if (vod) {
    await setSidePanel(tabId, false)
    await setSidePanel(tabId, true)
  } else {
    await setSidePanel(tabId, false)
  }
})

const prevHostnames: { [tabId: number]: string } = {}

// タブ更新時
webext.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  const { vod, capture } = await getSupportStatus(tabId)

  if (tab.active) {
    setContextMenu('ncoverlay:capture', capture)
  }

  if (vod) {
    try {
      const { hostname } = new URL(info.url ?? '')

      if (hostname !== prevHostnames[tabId]) {
        await setSidePanel(tabId, false)
      }

      prevHostnames[tabId] = hostname
    } catch {}

    await setSidePanel(tabId, true)
  } else {
    await setSidePanel(tabId, false)

    delete prevHostnames[tabId]
  }
})
