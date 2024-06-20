import type { PluginVodKey, Plugins } from '@/types/constants'

import { Logger } from './logger'
import { settings } from './settings/page'

export const execPlugins = async <VodKey extends PluginVodKey>(
  vod: VodKey,
  plugins: Plugins<VodKey>
) => {
  const enablePlugins = await settings.get('settings:plugins')

  for (const name in plugins) {
    // @ts-expect-error
    if (enablePlugins.includes(`${vod}:${name}`)) {
      Logger.log(`plugin: ${name}`)

      // @ts-expect-error
      plugins[name]()
    }
  }
}
