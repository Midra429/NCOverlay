import type { Part, PartData } from '@/types/danime/part'

const API_URL = 'https://animestore.docomo.ne.jp/animestore/rest/WS010105'

export const part = async (partId: string): Promise<PartData | null> => {
  try {
    const res = await fetch(
      `${API_URL}?${new URLSearchParams({
        viewType: '5',
        partId: partId,
      })}`
    )

    if (res.ok) {
      const json: Part = await res.json()

      if (json.data) {
        return json.data
      }
    }
  } catch (e) {
    console.error(e)
  }

  return null
}
