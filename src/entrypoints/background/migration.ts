import type { StorageItems_v4 } from '@/types/storage'

import { logger } from '@/utils/logger'
import { storage } from '@/utils/storage/extension'

export default async function () {
  let migrate_version = (await storage.get('_migrate_version')) ?? 1

  // v3.13.4 -> v3.20.2
  if (migrate_version < 4) {
    logger.log('migration', '3 -> 4')

    // @ts-ignore
    await storage.remove('settings:ng:useNiconicoAccount')

    migrate_version = 4
  }

  if (migrate_version < 5) {
    logger.log('migration', '4 -> 5')

    const [autoLoads, jikkyoChannelIds] = (await storage.get(
      // @ts-ignore
      'settings:comment:autoLoads',
      // @ts-ignore
      'settings:comment:jikkyoChannelIds'
    )) as unknown as [
      StorageItems_v4['settings:comment:autoLoads'] | null,
      StorageItems_v4['settings:comment:jikkyoChannelIds'] | null,
    ]

    await storage.set('settings:autoSearch:targets', autoLoads)
    await storage.set('settings:autoSearch:jikkyoChannelIds', jikkyoChannelIds)

    // @ts-ignore
    await storage.remove('settings:comment:autoLoads')
    // @ts-ignore
    await storage.remove('settings:comment:jikkyoChannelIds')

    migrate_version = 5
  }

  await storage.set('_migrate_version', migrate_version)
}
