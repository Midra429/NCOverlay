import type { StateKey } from '@/types/storage'

import { defineBackground } from '#imports'
import { ncoApi } from '@midra/nco-utils/api'
import { ncoSearch } from '@midra/nco-utils/search'

import { GITHUB_URL } from '@/constants'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { storage } from '@/utils/storage/extension'
import { settings } from '@/utils/settings/extension'
import { setBadge } from '@/utils/extension/setBadge'
import { getFormsUrl } from '@/utils/extension/getFormsUrl'
import { registerProxy } from '@/utils/proxy-service/register'
import { onMessage } from '@/utils/proxy-service/messaging/extension'
import { sendNcoMessage } from '@/ncoverlay/messaging'

import migration from './migration'
import registerUtilsMessage from './registerUtilsMessage'
import clearTemporaryData from './clearTemporaryData'
import requestPermissions from './requestPermissions'

export default defineBackground({
  type: 'module',
  main: () => void main(),
})

const main = async () => {
  logger.log('background.js')

  registerProxy('ncoApi', ncoApi, onMessage)
  registerProxy('ncoSearch', ncoSearch, onMessage)
  registerUtilsMessage()

  // インストール・アップデート時
  webext.runtime.onInstalled.addListener(async ({ reason }) => {
    // 権限をリクエスト
    requestPermissions()

    switch (reason) {
      case 'install':
        if (import.meta.env.PROD) {
          // README
          webext.tabs.create({
            url: `${GITHUB_URL}/blob/main/README.md`,
          })
        }

        break

      case 'update':
        await clearTemporaryData()
        await migration()

        if (
          import.meta.env.PROD &&
          (await settings.get('settings:showChangelog'))
        ) {
          const { version } = webext.runtime.getManifest()

          // リリースノート
          webext.tabs.create({
            url: `${GITHUB_URL}/releases/tag/v${version}`,
          })
        }

        break
    }
  })

  webext.runtime.onConnect.addListener((port) => {
    const tabId = port.sender?.tab?.id

    switch (port.name) {
      // NCOverlayインスタンス作成時
      case 'instance':
        let ncoId: string | undefined

        let intervalId: NodeJS.Timeout
        let timeoutId: NodeJS.Timeout

        const dispose = () => {
          logger.log('dispose()')

          // バッジリセット
          if (tabId) {
            setBadge({ text: null, tabId })
          }

          // state削除
          if (ncoId) {
            storage.get().then((values) => {
              const stateKeys = Object.keys(values).filter((key) =>
                key.startsWith(`state:${ncoId}:`)
              ) as StateKey[]

              if (stateKeys.length) {
                storage.remove(...stateKeys)
              }
            })
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
          webext.sidePanel.setOptions({
            enabled: false,
            tabId,
          })
        })

        break
    }
  })

  // タブ更新時
  webext.tabs.onUpdated.addListener(async (tabId) => {
    if (tabId === webext.tabs.TAB_ID_NONE) return

    if (!(await sendNcoMessage('getId', null, tabId))) {
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
          const url = await getFormsUrl()

          webext.tabs.create({ url })

          break
      }
    })
  })

  // サイドパネル
  webext.sidePanel.setOptions({ enabled: false })

  logger.log('settings', await settings.get())
}
