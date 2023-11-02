import webext from '@/webext'
import { VODS, VODS_ALLOW_CAPTURE } from '@/constants'

export const getSupportStatus = async (
  tabId?: number
): Promise<{
  vod: keyof typeof VODS | null
  capture: boolean
}> => {
  if (typeof tabId !== 'undefined') {
    try {
      const tab = await webext.tabs.get(tabId)

      const permissions =
        /^https?:\/\/.+/.test(tab.url!) &&
        (await webext.permissions.contains({
          origins: [tab.url!],
        }))

      if (permissions) {
        const [{ result }] = await webext.scripting.executeScript({
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

        if (result) {
          return result
        }
      }
    } catch {}
  }

  return {
    vod: null,
    capture: false,
  }
}
