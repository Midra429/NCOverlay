import type { PluginVodKey, PluginId, Plugins } from '@/types/constants'

import { Logger } from '@/utils/logger'
import { settings } from '@/utils/settings/page'

export const execPlugins = async <VodKey extends PluginVodKey>(
  vod: VodKey,
  plugins: Plugins<VodKey>
) => {
  const pluginIds = Object.keys(plugins) as PluginId<VodKey>[]
  const disablePluginFunctions = new Map<PluginId<VodKey>, () => void>()

  settings.loadAndWatch('settings:plugins', (keys) => {
    pluginIds.forEach((id) => {
      const pluginKey = `${vod}:${id}` as const

      // プラグイン ON
      if (keys.includes(pluginKey) && !disablePluginFunctions.has(id)) {
        Logger.log(`plugin (enable): ${id}`)

        const disablePlugin = plugins[id]()

        disablePluginFunctions.set(id, disablePlugin)
      }
      // プラグイン OFF
      else if (!keys.includes(pluginKey) && disablePluginFunctions.has(id)) {
        Logger.log(`plugin (disable): ${id}`)

        const disablePlugin = disablePluginFunctions.get(id)!

        disablePlugin()

        disablePluginFunctions.delete(id)
      }
    })
  })
}
