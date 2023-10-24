export const getCurrentTab = async (
  windowId?: number
): Promise<chrome.tabs.Tab | undefined> => {
  const [tab] = await chrome.tabs.query(
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
