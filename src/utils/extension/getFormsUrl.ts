import type { Runtime } from 'wxt/browser'
import type { StateVod, StateInfo } from '@/ncoverlay/state'

import { GOOGLE_FORMS_URL, GOOGLE_FORMS_IDS, VODS } from '@/constants'
import { webext } from '@/utils/webext'

const CONTENTS = {
  bug: '不具合報告',
  suggestion: '機能提案',
  other: 'その他',
} as const

const OS_NAMES: Partial<Record<Runtime.PlatformOs, string>> = {
  win: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  cros: 'ChromeOS',
  android: 'Android',
}

export const getFormsUrl = async (inputs?: {
  content?: keyof typeof CONTENTS
  vod?: StateVod | null
  info?: StateInfo | null
  url?: string | null
}) => {
  const { version } = webext.runtime.getManifest()
  const { os } = await webext.runtime.getPlatformInfo()

  const osName = OS_NAMES[os]

  const url = new URL(GOOGLE_FORMS_URL)

  url.searchParams.set(`entry.${GOOGLE_FORMS_IDS.VERSION}`, version)

  if (osName) {
    url.searchParams.set(`entry.${GOOGLE_FORMS_IDS.OS}`, osName)
  }

  if (webext.isChrome) {
    url.searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Chrome')
  } else if (webext.isFirefox) {
    url.searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Firefox')
  }

  if (inputs?.content) {
    url.searchParams.set(
      `entry.${GOOGLE_FORMS_IDS.CONTENT}`,
      CONTENTS[inputs.content]
    )
  }

  if (inputs?.vod) {
    url.searchParams.set(`entry.${GOOGLE_FORMS_IDS.VODS}`, VODS[inputs.vod])
  }

  const title = [inputs?.info, inputs?.url].filter(Boolean).join('\n\n').trim()

  if (title) {
    url.searchParams.set(`entry.${GOOGLE_FORMS_IDS.TITLE}`, title)
  }

  return url.href
}
