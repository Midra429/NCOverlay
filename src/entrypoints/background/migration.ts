import type { StorageItems_v0 } from '@/types/storage'

import { Logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'

export default async () => {
  const migrate_version = (await storage.get('_migrate_version')) ?? 0

  /**
   * v2.x.x -> v3.0.0
   */
  if (migrate_version < 1) {
    Logger.log('migration: v2.x.x -> v3.0.0')

    const items_v0 =
      (await storage.get()) as unknown as Partial<StorageItems_v0>

    await storage.remove()

    await Promise.all([
      storage.set('settings:showChangelog', items_v0.showChangelog),
      storage.set('settings:comment:autoLoadSzbh', items_v0.szbhMethod),
      storage.set('settings:comment:useNglist', items_v0.useNgList),
      storage.set('settings:comment:opacity', items_v0.opacity),
      storage.set(
        'settings:comment:fps',
        items_v0.lowPerformance ? 30 : undefined
      ),
    ])

    await storage.set('_migrate_version', 1)
  }
}
