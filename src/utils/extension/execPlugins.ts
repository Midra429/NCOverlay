import type {
  PluginKey,
  PluginVodKey,
  PluginId,
  Plugins,
} from '@/types/constants'

import { logger } from '@/utils/logger'
import { settings } from '@/utils/settings/page'

export async function execPlugins<K extends PluginVodKey>(
  vod: K,
  plugins: Plugins<K>
) {
  const enabledVods = await settings.get('settings:vods')

  if (!enabledVods.includes(vod)) return

  logger.log('plugin', vod)

  const pluginIds = Object.keys(plugins) as PluginId<K>[]
  const disablePlugins = new Map<PluginId<K>, () => void>()

  settings.watch('settings:plugins', (keys) => {
    for (const id of pluginIds) {
      const pluginKey = `${vod}:${id}` as PluginKey

      // プラグイン ON
      if (keys.includes(pluginKey) && !disablePlugins.has(id)) {
        logger.log('plugin (enable)', id)

        disablePlugins.set(id, plugins[id]())
      }
      // プラグイン OFF
      else if (!keys.includes(pluginKey) && disablePlugins.has(id)) {
        logger.log('plugin (disable)', id)

        disablePlugins.get(id)!()
        disablePlugins.delete(id)
      }
    }
  })
}
