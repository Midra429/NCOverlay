import webext from '@/webext'
import { getCurrentTab } from '@/utils/webext/getCurrentTab'

export const getFromPage = async () => {
  const tab = await getCurrentTab()

  if (typeof tab?.id !== 'undefined') {
    try {
      const res = await webext.tabs.sendMessage<'webext:getFromPage'>(tab.id, {
        type: 'webext:getFromPage',
        body: undefined,
      })

      if (res?.result) {
        return res
      }
    } catch {}
  }

  return null
}
