import { defineBackground } from 'wxt/sandbox'

import { GITHUB_URL } from '@/constants'

import { Logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { storage } from '@/utils/storage/extension'
import { settings } from '@/utils/settings/extension'
import { setBadge } from '@/utils/extension/setBadge'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'
import { getNcoId } from '@/utils/extension/getNcoId'

// import migration from './migration'
import registerProxyService from './registerProxyService'
import registerUtilsMessage from './registerUtilsMessage'
import clearTemporaryData from './clearTemporaryData'
import requestPermissions from './requestPermissions'

export default defineBackground({
  type: 'module',
  main: () => void main(),
})

const main = async () => {
  Logger.log('background.js')

  registerProxyService()
  registerUtilsMessage()

  // インストール・アップデート時
  webext.runtime.onInstalled.addListener(async ({ reason }) => {
    const { version } = webext.runtime.getManifest()

    // 権限をリクエスト
    requestPermissions()

    switch (reason) {
      case 'install':
        if (import.meta.env.PROD) {
          // README
          webext.tabs.create({
            url: `${GITHUB_URL}/blob/v${version}/README.md`,
          })
        }

        break

      case 'update':
        await clearTemporaryData()
        // await migration()

        if (
          import.meta.env.PROD &&
          (await settings.get('settings:showChangelog'))
        ) {
          // リリースノート
          webext.tabs.create({
            url: `${GITHUB_URL}/releases/tag/v${version}`,
          })
        }

        break
    }
  })

  webext.runtime.onConnect.addListener((port) => {
    switch (port.name) {
      // NCOverlayインスタンス作成時
      case 'instance':
        const tabId = port.sender?.tab?.id
        let ncoId: string | null = null

        let intervalId: NodeJS.Timeout
        let timeoutId: NodeJS.Timeout

        const dispose = () => {
          Logger.log('dispose()')

          // バッジリセット
          if (tabId) {
            setBadge({ text: null, tabId })
          }

          // 一時データ削除
          if (ncoId) {
            storage.remove(`tmp:state:${ncoId}`)
          }

          clearInterval(intervalId)
          clearTimeout(timeoutId)
        }

        port.onDisconnect.addListener(dispose)

        port.onMessage.addListener((message) => {
          if (typeof message === 'string') {
            const [type, data] = message.split(':')

            switch (type) {
              case 'pong':
                clearTimeout(timeoutId)

                ncoId = data
                timeoutId = setTimeout(dispose, 15000)

                break
            }
          }
        })

        port.postMessage('ping')

        intervalId = setInterval(() => {
          port.postMessage('ping')
        }, 10000)

        break

      // サイドパネル
      case 'sidepanel':
        port.onDisconnect.addListener(async () => {
          const tab = await webext.getCurrentActiveTab()

          webext.sidePanel.setOptions({
            enabled: false,
            tabId: tab?.id,
          })
        })

        break
    }
  })

  // タブ更新時
  webext.tabs.onUpdated.addListener(async (tabId) => {
    if (tabId === webext.tabs.TAB_ID_NONE) return

    if (!(await getNcoId(tabId))) {
      webext.sidePanel.setOptions({
        enabled: false,
        path: webext.sidePanel.path,
        tabId,
      })
    }
  })

  // コンテキストメニュー
  webext.contextMenus.removeAll().then(() => {
    webext.contextMenus.create({
      id: 'report',
      title: '不具合報告・機能提案・その他',
      contexts: ['action'],
    })

    webext.contextMenus.onClicked.addListener(async ({ menuItemId }) => {
      switch (menuItemId) {
        case 'report':
          webext.tabs.create({
            url: await getFormsUrl(),
          })

          break
      }
    })
  })

  // サイドパネル
  webext.sidePanel.setOptions({ enabled: false })
}
