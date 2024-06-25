import { defineBackground } from 'wxt/sandbox'

import { GITHUB_URL } from '@/constants'

import { Logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { storage } from '@/utils/storage/extension'
import { settings } from '@/utils/settings/extension'

import migration from './migration'
import onNcoApiMessage from './onNcoApiMessage'
import clearTemporaryData from './clearTemporaryData'

export default defineBackground({
  type: 'module',
  main: () => void main(),
})

const main = () => {
  Logger.log('background.js')

  onNcoApiMessage()

  webext.runtime.onConnect.addListener(async (port) => {
    let timeoutId: number | null = null

    port.onMessage.addListener((message) => {
      if (typeof message === 'string' && message.startsWith('heartbeat:')) {
        if (timeoutId) {
          window.clearTimeout(timeoutId)
        }

        timeoutId = window.setTimeout(() => {
          storage.remove(`tmp:state:${message.split(':')[1]}`)
        }, 10000)
      }
    })
  })

  webext.runtime.onInstalled.addListener(async ({ reason }) => {
    const { version } = webext.runtime.getManifest()

    switch (reason) {
      case 'install': {
        if (import.meta.env.PROD) {
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
          webext.tabs.create({
            url: `${GITHUB_URL}/releases/tag/v${version}`,
          })
        }

        break
      }
    }
  })

  void (async () => {
    Logger.log('storage', await storage.get())
    Logger.log('settings', await settings.get())
  })()
}
