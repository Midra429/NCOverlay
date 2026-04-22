import type {
  PluginId,
  PluginKey,
  PluginVodKey,
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

  const disablePlugins = new Map<PluginId<K>, () => void>()

  settings.watch('settings:plugins', (keys) => {
    for (const key in plugins) {
      const id = key as PluginId<K>
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
