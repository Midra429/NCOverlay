import type { Program } from '@/types/abema/program'

const API_URL = 'https://api.p-c3-e.abema-tv.com/v1/video/programs'

export const program = async (id: string) => {
  const token = localStorage.getItem('abm_token')

  const url = `${API_URL}/${id}?${new URLSearchParams({
    division: '0',
    include: 'tvod',
  })}`

  if (token) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const json: Program = await res.json()

        if (json) {
          return json
        }
      }
    } catch (e) {
      console.error('[NCOverlay] Error', e)
    }
  }

  return null
}
