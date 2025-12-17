import type { Browser } from '@/utils/webext'

import { webext } from '@/utils/webext'

export type OpenAction =
  | 'import-settings'
  | 'export-settings'
  | 'select-comment-file'

export async function openPopout(
  action: OpenAction,
  createData?: Browser.OpenPopoutCreateData
) {
  const tab = await webext.getCurrentActiveTab()

  if (tab?.id != null) {
    const windowInfo = await webext.windows.get(tab.windowId)

    const url = new URL(webext.runtime.getURL('/popout.html'))

    url.searchParams.set(webext.SEARCH_PARAM_TAB_ID, tab.id.toString())
    url.searchParams.set('action', action)

    const width = createData?.width ?? window.innerWidth
    const height = createData?.height ?? window.innerHeight
    const top = createData?.top ?? windowInfo.top! + 90
    const left =
      createData?.left ?? windowInfo.left! + (windowInfo.width! - width) - 15

    await webext.windows.create({
      ...createData,
      type: 'popup',
      url: url.href,
      top,
      left,
      width,
      height,
    })

    window.close()
  }
}
