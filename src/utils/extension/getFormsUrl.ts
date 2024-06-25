import type { Runtime } from 'wxt/browser'

import { GOOGLE_FORMS_URL, GOOGLE_FORMS_IDS } from '@/constants'
import { webext } from '@/utils/webext'

const OS_NAMES: Partial<Record<Runtime.PlatformOs, string>> = {
  win: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  cros: 'ChromeOS',
  android: 'Android',
}

export const getFormsUrl = async () => {
  const { version } = webext.runtime.getManifest()
  const { os } = await webext.runtime.getPlatformInfo()

  const osName = OS_NAMES[os]

  const searchParams = new URLSearchParams()

  searchParams.set(`entry.${GOOGLE_FORMS_IDS.VERSION}`, version)

  if (osName) {
    searchParams.set(`entry.${GOOGLE_FORMS_IDS.OS}`, osName)
  }

  if (webext.isChrome) {
    searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Chrome')
  } else if (webext.isFirefox) {
    searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Firefox')
  }

  return `${GOOGLE_FORMS_URL}?${searchParams}`
}
