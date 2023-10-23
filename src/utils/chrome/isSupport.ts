export const isSupport = async (tabId: number): Promise<boolean> => {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.documentElement.classList.contains('NCOverlay'),
    })

    return result
  } catch {}

  return false
}
