import { ncoApiProxy } from '@/proxy/nco-utils/api/extension'

export const searchSyobocalByIds = async (...tids: string[]) => {
  const response = await ncoApiProxy.syobocal.json(['TitleMedium'], {
    TID: tids,
  })

  if (response) {
    return Object.values(response.Titles)
  }

  return null
}

export const searchSyobocalByKeyword = async (keyword: string) => {
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
