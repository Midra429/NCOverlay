import type { Permissions } from 'webextension-polyfill'

import { webext } from '@/utils/webext'

export default function () {
  // 権限を要求 (Firefoxのみ)
  if (webext.isFirefox) {
    const manifest = webext.runtime.getManifest()
    const permissions: Permissions.Permissions = {
      origins: manifest.host_permissions,
    }

    webext.permissions.contains(permissions).then((permitted) => {
      if (permitted) return

      async function requestPermissions() {
        const permitted = await webext.permissions.request(permissions)

        if (permitted) {
          webext.action.setPopup({
            popup: manifest.action!.default_popup!,
          })
          webext.action.onClicked.removeListener(requestPermissions)
        }
      }

      webext.action.setPopup({ popup: '' })
      webext.action.onClicked.addListener(requestPermissions)
    })
  }
}
