import { webext } from '@/utils/webext'

export type OpenAction =
  | 'import-settings'
  | 'export-settings'
  | 'select-comment-files'

export interface OpenOptions {
  width?: number
  height?: number
}

export async function openPopupWindow(
  action: OpenAction,
  options: OpenOptions = {
    width: 500,
    height: 400,
  }
) {
  const tab = await webext.getCurrentActiveTab()

  if (tab) {
    const url = new URL(webext.runtime.getURL('/popup-windows.html'))

    url.searchParams.set(webext.SEARCH_PARAM_TAB_ID, tab.id!.toString())
    url.searchParams.set('action', action)

    await webext.windows.create({
      type: 'popup',
      width: options.width,
      height: options.height,
      url: url.href,
    })

    window.close()
  }
}
