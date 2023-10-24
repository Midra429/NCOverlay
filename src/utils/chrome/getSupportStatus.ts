import { VODS, VODS_ALLOW_CAPTURE } from '@/constants'

export const getSupportStatus = async (
  tabId?: number
): Promise<{
  vod: keyof typeof VODS | null
  capture: boolean
}> => {
  if (typeof tabId !== 'undefined') {
    const tab = await chrome.tabs.get(tabId)

    const permissions =
      /^https?:\/\/.+/.test(tab.url!) &&
      (await chrome.permissions.contains({
        origins: [tab.url!],
      }))

    if (permissions) {
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
    }
  }

  return {
    vod: null,
    capture: false,
  }
}
