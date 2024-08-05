import type { PublicPath } from 'wxt/browser'

import { webext } from '@/utils/webext'

export const injectScript = (path: PublicPath) => {
  const script = document.createElement('script')

  script.src = webext.runtime.getURL(path)

  script.onload = () => script.remove()

  document.documentElement.appendChild(script)
}
