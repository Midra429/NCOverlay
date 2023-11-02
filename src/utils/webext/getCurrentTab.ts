import webext from '@/webext'

export const getCurrentTab = async (
  windowId?: number
): Promise<webext.Tabs.Tab | undefined> => {
  const [tab] = await webext.tabs.query(
    typeof windowId === 'undefined'
      ? {
          active: true,
          lastFocusedWindow: true,
        }
      : {
          active: true,
          windowId: windowId,
        }
  )

  return tab
}
