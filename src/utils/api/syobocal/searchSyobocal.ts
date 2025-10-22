import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export async function searchSyobocalByIds(...tids: string[]) {
  const response = await ncoApiProxy.syobocal.json(['TitleMedium'], {
    TID: tids,
  })

  if (response) {
    return Object.values(response.Titles)
  }

  return null
}

export async function searchSyobocalByKeyword(keyword: string) {
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
