import { storage } from '@/utils/storage/extension'

export default async () => {
  const values = await storage.get()
  const keys = Object.keys(values).filter(
    (key) => key.startsWith('tmp:') || key.startsWith(`state:`)
  ) as (keyof typeof values)[]

  if (keys.length) {
    storage.remove(...keys)
  }
}
