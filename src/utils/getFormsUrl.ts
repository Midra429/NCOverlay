import { GOOGLE_FORMS_URL, GOOGLE_FORMS_IDS } from '@/constants'
import webext from '@/webext'

const OsNames: Partial<Record<webext.Runtime.PlatformOs, string>> = {
  win: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  cros: 'ChromeOS',
  android: 'Android',
}

export const getFormsUrl = async () => {
  const { version } = webext.runtime.getManifest()
  const { os } = await webext.runtime.getPlatformInfo()
  const osName = OsNames[os]

  const params: Record<string, string> = {}

  params[`entry.${GOOGLE_FORMS_IDS.VERSION}`] = version

  if (osName) {
    params[`entry.${GOOGLE_FORMS_IDS.OS}`] = osName
  }

  if (webext.isChrome) {
    params[`entry.${GOOGLE_FORMS_IDS.BROWSER}`] = 'Chrome'
  }
  if (webext.isFirefox) {
    params[`entry.${GOOGLE_FORMS_IDS.BROWSER}`] = 'Firefox'
  }

  return `${GOOGLE_FORMS_URL}?${new URLSearchParams(params)}`
}
