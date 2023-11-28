import type {
  WebExtMessage,
  WebExtMessageResponse,
} from '@/types/webext/message'
import { WebExtMessageTypeCheck } from '@/types/webext/message'
import {
  ACTION_ICONS_ENABLE,
  ACTION_ICONS_DISABLE,
  GITHUB_URL,
  GOOGLE_FORMS_URL,
  GOOGLE_FORMS_ID_VERSION,
} from '@/constants'
import webext from '@/webext'
import { WebExtStorageApi } from '@/utils/webext/storage'
import { getSupportStatus } from '@/utils/webext/getSupportStatus'
import { getCurrentTab } from '@/utils/webext/getCurrentTab'
import { NiconicoApi } from './api/niconico'

console.log('[NCOverlay] background.js')

const manifest = webext.runtime.getManifest()

const setAction = async (enabled: boolean, tabId?: number) => {
  if (enabled) {
    await webext.action.enable(tabId)
  } else {
    await webext.action.disable(tabId)
  }

  await webext.action.setIcon({
    tabId,
    path: enabled ? ACTION_ICONS_ENABLE : ACTION_ICONS_DISABLE,
  })
}

const setContextMenu = (id: string | number, enabled: boolean) => {
  return webext.contextMenus.update(id, { enabled })
}

const setSidePanel = (enabled: boolean, tabId?: number) => {
  // Chrome
  if (webext.isChrome && webext.sidePanel) {
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

  webext.contextMenus.create({
    id: 'ncoverlay:capture:comments',
    title: 'スクリーンショット (コメントのみ)',
    contexts: ['action'],
    enabled: false,
  })

  webext.contextMenus.create({
    id: 'ncoverlay:report',
    title: '不具合報告・機能提案・その他',
    contexts: ['action'],
  })
})

webext.contextMenus.onClicked.addListener(async ({ menuItemId }, tab) => {
  if (typeof tab?.id === 'undefined') return

  const { capture } = await getSupportStatus(tab.id)

  if (
    (menuItemId === 'ncoverlay:capture' && capture) ||
    menuItemId === 'ncoverlay:capture:comments'
  ) {
    await webext.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [menuItemId],
      func: (id) => document.dispatchEvent(new Event(id)),
    })
  }

  if (menuItemId === 'ncoverlay:report') {
    webext.tabs.create({
      url: `${GOOGLE_FORMS_URL}?entry.${GOOGLE_FORMS_ID_VERSION}=${manifest.version}`,
    })
  }
})

webext.runtime.onInstalled.addListener(async (details) => {
  const settings = await WebExtStorageApi.getSettings()

  // 権限を要求 (Firefoxのみ)
  if (
    webext.isFirefox &&
    (details.reason === 'install' || details.reason === 'update')
  ) {
    const permitted = await webext.permissions.contains({
      origins: manifest.host_permissions,
    })

    if (!permitted) {
      const requestPermissions = async () => {
        const permitted = await webext.permissions.request({
          origins: manifest.host_permissions,
        })

        if (permitted) {
          await setAction(false)
          webext.action.setPopup({ popup: manifest.action!.default_popup! })
          webext.action.onClicked.removeListener(requestPermissions)

          try {
            const tab = await getCurrentTab()
            const isPermittedSite = manifest
              .host_permissions!.map((v) => v.match(/^https?:\/\/(.*)\//)?.[1])
              .filter(Boolean)
              .includes(new URL(tab?.url ?? '').hostname)

            if (isPermittedSite) {
              webext.tabs.reload(tab!.id)
            }
          } catch {}
        }
      }

      await setAction(true)
      webext.action.setPopup({ popup: '' })
      webext.action.onClicked.addListener(requestPermissions)
    }
  }

  if (details.reason === 'install') {
    webext.tabs.create({
      url: `${GITHUB_URL}/blob/v${manifest.version}/README.md`,
    })
  }

  if (details.reason === 'update' && settings.showChangelog) {
    webext.tabs.create({
      url: `${GITHUB_URL}/releases/tag/v${manifest.version}`,
    })
  }
})

webext.runtime.onMessage.addListener(
  (
    message: WebExtMessage,
    sender,
    sendResponse: (response: WebExtMessageResponse) => void
  ) => {
    let promise: Promise<any> | null = null

    // ニコニコ 検索
    if (WebExtMessageTypeCheck('niconico:search', message)) {
      promise = NiconicoApi.search(...message.body)
    }

    // ニコニコ 動画情報
    if (WebExtMessageTypeCheck('niconico:video', message)) {
      promise = NiconicoApi.video(...message.body)
    }

    // ニコニコ コメント
    if (WebExtMessageTypeCheck('niconico:threads', message)) {
      promise = NiconicoApi.threads(...message.body)
    }

    // 拡張機能 アクション 有効/無効
    if (WebExtMessageTypeCheck('webext:action', message)) {
      setAction(message.body, sender.tab?.id)
    }

    // 拡張機能 アクション バッジ
    if (WebExtMessageTypeCheck('webext:action:badge', message)) {
      webext.action.setBadgeText({
        tabId: sender.tab?.id,
        text: message.body.toString(),
      })
    }

    // 拡張機能 アクション タイトル (ツールチップ)
    if (WebExtMessageTypeCheck('webext:action:title', message)) {
      webext.action.setTitle({
        tabId: sender.tab?.id,
        title: message.body,
      })
    }

    // 拡張機能 サイドパネル 有効/無効
    if (WebExtMessageTypeCheck('webext:side_panel', message)) {
      // Chrome
      if (webext.isChrome && webext.sidePanel) {
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
  const { vod, capture } = await getSupportStatus(tab?.id)

  setContextMenu('ncoverlay:capture', capture)
  setContextMenu('ncoverlay:capture:comments', !!vod)
})

// タブ変更時
webext.tabs.onActivated.addListener(async ({ tabId }) => {
  const { vod, capture } = await getSupportStatus(tabId)

  setContextMenu('ncoverlay:capture', capture)
  setContextMenu('ncoverlay:capture:comments', !!vod)

  if (vod) {
    await setSidePanel(false, tabId)
    await setSidePanel(true, tabId)
  } else {
    await setSidePanel(false, tabId)
  }
})

const prevHostnames: { [tabId: number]: string } = {}

// タブ更新時
webext.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  const { vod, capture } = await getSupportStatus(tabId)

  if (tab.active) {
    setContextMenu('ncoverlay:capture', capture)
    setContextMenu('ncoverlay:capture:comments', !!vod)
  }

  if (vod) {
    try {
      const { hostname } = new URL(info.url ?? '')

      if (hostname !== prevHostnames[tabId]) {
        await setSidePanel(false, tabId)
      }

      prevHostnames[tabId] = hostname
    } catch {}

    await setSidePanel(true, tabId)
  } else {
    await setSidePanel(false, tabId)

    delete prevHostnames[tabId]
  }
})
