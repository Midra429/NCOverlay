import type { StorageItems_v1, StorageItems_v2 } from '@/types/storage'

import { Logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'

export default async () => {
  const migrate_version = (await storage.get('_migrate_version')) ?? 1

  // v3.x.x -> v3.10.0
  if (migrate_version < 2) {
    Logger.log('migration: v3.x.x -> v3.10.0')

    const items_v1 =
      (await storage.get()) as unknown as Partial<StorageItems_v1>

    await storage.remove(
      // @ts-ignore
      'settings:comment:autoLoad',
      'settings:comment:autoLoadSzbh',
      'settings:comment:autoLoadChapter',
      'settings:comment:autoLoadJikkyo',
      'settings:experimental:useAiParser'
    )

    const autoLoads: StorageItems_v2['settings:comment:autoLoads'] = []

    if (items_v1['settings:comment:autoLoad']) {
      autoLoads.push('normal')
    }
    if (items_v1['settings:comment:autoLoadSzbh']) {
      autoLoads.push('szbh')
    }
    if (items_v1['settings:comment:autoLoadChapter']) {
      autoLoads.push('chapter')
    }
    if (items_v1['settings:comment:autoLoadJikkyo']) {
      autoLoads.push('jikkyo')
    }

    if (autoLoads.length) {
      await storage.set('settings:comment:autoLoads', autoLoads)
    }

    await storage.set('_migrate_version', 2)
  }
}
