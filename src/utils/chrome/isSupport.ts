export const isSupport = async (tabId?: number): Promise<boolean> => {
  if (typeof tabId !== 'undefined') {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.documentElement.classList.contains('NCOverlay'),
      })

      return result
    } catch {}
  }

  return false
}
