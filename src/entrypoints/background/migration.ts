import type { StorageItems_v2 } from '@/types/storage'

import { logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'

export default async () => {
  const migrate_version = (await storage.get('_migrate_version')) ?? 1

  // v3.10.0 -> v3.13.1
  if (migrate_version < 3) {
    logger.log('migration: v3.10.0 -> v3.13.1')

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

  // v3.13.3 -> v3.13.4
  if (migrate_version < 4) {
    logger.log('migration: v3.13.3 -> v3.13.4')

    const { 'settings:comment:autoLoads': autoLoads } = await storage.get()

    if (autoLoads?.includes('official')) {
      await storage.set('settings:comment:autoLoads', [
        ...new Set<(typeof autoLoads)[number]>([
          'official',
          'danime',
          ...autoLoads,
        ]),
      ])
    }

    await storage.set('_migrate_version', 4)
  }
}
