import type { Part, PartData } from '@/types/danime/part'
import { DANIME_PART_API } from '@/constants'

export const part = async (partId: string): Promise<PartData | null> => {
  try {
    const res = await fetch(
      `${DANIME_PART_API}?${new URLSearchParams({
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
    console.error('[NCOverlay] Error', e)
  }

  return null
}
