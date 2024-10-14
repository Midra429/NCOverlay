import { ncoApi } from '@midra/nco-api'

export const searchSyobocalByIds = async (...tids: string[]) => {
  const response = await ncoApi.syobocal.json(['TitleMedium'], {
    TID: tids,
  })

  if (response) {
    return Object.values(response.Titles)
  }

  return null
}

export const searchSyobocalByKeyword = async (keyword: string) => {
  const limit = 20

  const response = await ncoApi.syobocal.json(['TitleSearch'], {
    Search: keyword,
    Limit: limit,
  })

  if (response) {
    return Object.values(response.Titles)
  }

  return null
}
