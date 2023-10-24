import type { ChromeMessage, ChromeResponse } from '@/types/chrome/message'
import { getCurrentTab } from '@/utils/chrome/getCurrentTab'

export const getFromPage =
  async (): Promise<ChromeResponse<'chrome:getFromPage'> | null> => {
    const tab = await getCurrentTab()

    if (typeof tab?.id !== 'undefined') {
      try {
        const res = await chrome.tabs.sendMessage<
          ChromeMessage<'chrome:getFromPage'>,
          ChromeResponse<'chrome:getFromPage'>
        >(tab.id, {
          type: 'chrome:getFromPage',
          body: undefined,
        })

        if (res?.result) {
          return res
        }
      } catch {}
    }

    return null
  }
