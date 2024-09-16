import type {
  PluginKey,
  PluginVodKey,
  PluginId,
  Plugins,
} from '@/types/constants'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/page'

export const execPlugins = async <VodKey extends PluginVodKey>(
  vod: VodKey,
  plugins: Plugins<VodKey>
) => {
  const pluginIds = Object.keys(plugins) as PluginId<VodKey>[]
  const disablePlugins = new Map<PluginId<VodKey>, () => void>()

  settings.watch('settings:plugins', (keys) => {
    pluginIds.forEach((id) => {
      const pluginKey = `${vod}:${id}` as PluginKey

      // プラグイン ON
      if (keys.includes(pluginKey) && !disablePlugins.has(id)) {
        logger.log(`plugin (enable): ${id}`)

        disablePlugins.set(id, plugins[id]())
      }
      // プラグイン OFF
      else if (!keys.includes(pluginKey) && disablePlugins.has(id)) {
        logger.log(`plugin (disable): ${id}`)

        disablePlugins.get(id)!()
        disablePlugins.delete(id)
      }
    })
  })
}
