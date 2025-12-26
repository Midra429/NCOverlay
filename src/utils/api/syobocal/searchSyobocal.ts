import type {
  SyoboCalTitleMedium,
  SyoboCalTitleSearch,
} from '@midra/nco-utils/types/api/syobocal/json'

import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export async function searchSyobocalByIds(
  ...tids: string[]
): Promise<SyoboCalTitleMedium[] | null> {
  const response = await ncoApiProxy.syobocal.json(['TitleMedium'], {
    TID: tids,
  })

  if (response) {
    return Object.values(response.Titles)
  }

  return null
}

export async function searchSyobocalByKeyword(
  keyword: string
): Promise<SyoboCalTitleSearch[] | null> {
  const limit = 20

  const response = await ncoApiProxy.syobocal.json(['TitleSearch'], {
    Search: keyword,
    Limit: limit,
  })

  if (response) {
    return Object.values(response.Titles)
  }

  return null
}
