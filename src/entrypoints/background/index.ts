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
  clearTemporaryData()

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
