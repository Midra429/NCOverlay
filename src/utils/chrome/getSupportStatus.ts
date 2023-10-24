import { VODS, VODS_ALLOW_CAPTURE } from '@/constants'

export const getSupportStatus = async (
  tabId?: number
): Promise<{
  vod: keyof typeof VODS | null
  capture: boolean
}> => {
  if (typeof tabId !== 'undefined') {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        args: [VODS_ALLOW_CAPTURE],
        func: (vodsAllowCapture) => {
          const vod = document.documentElement.dataset.ncoVod as
            | keyof typeof VODS
            | undefined

          return {
            vod: vod || null,
            capture: vod ? vodsAllowCapture.includes(vod) : false,
          }
        },
      })

      return result
    } catch {}
  }

  return {
    vod: null,
    capture: false,
  }
}
