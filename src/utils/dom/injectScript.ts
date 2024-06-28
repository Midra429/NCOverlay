import type { PublicPath } from 'wxt/browser'

import { webext } from '@/utils/webext'

export const injectScript = (src: PublicPath) => {
  const script = document.createElement('script')

  script.src = webext.runtime.getURL(src)

  script.addEventListener('load', function () {
    this.remove()
  })

  document.documentElement.appendChild(script)
}
