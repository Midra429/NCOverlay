// import type { StorageItems_v3 } from '@/types/storage'

import { logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'

export default async function () {
  const migrate_version = (await storage.get('_migrate_version')) ?? 1

  // v3.13.4 -> v3.20.2
  if (migrate_version < 4) {
    logger.log('migration: v3.13.4 -> v3.20.2')

    // @ts-ignore
    await storage.remove('settings:ng:useNiconicoAccount')

    await storage.set('_migrate_version', 4)
  }
}
