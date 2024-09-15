import type { StorageItems_v2 } from '@/types/storage'

import { Logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'

export default async () => {
  const migrate_version = (await storage.get('_migrate_version')) ?? 1

  // v3.10.0 -> v3.13.1
  if (migrate_version < 3) {
    Logger.log('migration: v3.x.x -> v3.10.0')

    const { 'settings:comment:autoLoads': autoLoads } =
      (await storage.get()) as unknown as Partial<StorageItems_v2>

    if (autoLoads?.includes('normal')) {
      await storage.set('settings:comment:autoLoads', [
        'official',
        ...autoLoads.filter((v) => v !== 'normal'),
      ])
    }

    await storage.set('_migrate_version', 3)
  }
}
