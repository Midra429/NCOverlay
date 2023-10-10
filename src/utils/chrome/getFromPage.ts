import type { ChromeMessage, ChromeResponse } from '@/types/chrome/message'

export const getFromPage =
  async (): Promise<ChromeResponse<'chrome:getFromPage'> | null> => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (tab?.id) {
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
    }

    return null
  }
