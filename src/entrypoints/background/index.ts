import { defineBackground } from 'wxt/sandbox'

import { GITHUB_URL } from '@/constants'

import { Logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { storage } from '@/utils/storage/extension'
import { settings } from '@/utils/settings/extension'
import { setBadge } from '@/utils/extension/setBadge'

import migration from './migration'
import onUtilsMessage from './onUtilsMessage'
import onNcoApiMessage from './onNcoApiMessage'
import clearTemporaryData from './clearTemporaryData'

export default defineBackground({
  type: 'module',
  main: () => void main(),
})

const main = () => {
  Logger.log('background.js')

  onUtilsMessage()
  onNcoApiMessage()

  // インストール・アップデート時
  webext.runtime.onInstalled.addListener(async ({ reason }) => {
    const { version } = webext.runtime.getManifest()

    setBadge({
      text: null,
      color: 'primary',
    })

    switch (reason) {
      case 'install': {
        if (import.meta.env.PROD) {
          // README
          webext.tabs.create({
            url: `${GITHUB_URL}/blob/v${version}/README.md`,
          })
        }

        break
      }

      case 'update': {
        await clearTemporaryData()
        await migration()

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
    }
  })

  webext.runtime.onConnect.addListener(async (port) => {
    let timeoutId: NodeJS.Timeout | null = null

    port.onMessage.addListener((message) => {
      // 生存確認
      if (typeof message === 'string' && message.startsWith('heartbeat:')) {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(
          async (id, tabId) => {
            // 一時データ削除
            storage.remove(`tmp:state:${id}`)

            // バッジリセット
            setBadge({ text: null, tabId })
          },
          10000,
          message.split(':')[1],
          port.sender?.tab?.id
        )
      }
    })
  })

  void (async () => {
    Logger.log('storage', await storage.get())
    Logger.log('settings', await settings.get())
  })()
}
