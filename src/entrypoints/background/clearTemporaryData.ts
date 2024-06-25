import type { TemporaryKey } from '@/types/storage'

import { storage } from '@/utils/storage/extension'

export default async () => {
  const values = await storage.get()
  const tmpKeys = Object.keys(values).filter((key) =>
    key.startsWith('tmp:')
  ) as TemporaryKey[]

  if (tmpKeys.length) {
    await storage.remove(...tmpKeys)
  }
}
