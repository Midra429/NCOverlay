import type { Runtime } from 'webextension-polyfill'
import type {
  ExtractedResult,
  ExtractedResultSingleEpisode,
  ExtractedResultMultipleEpisodes,
} from '@midra/nco-utils/parse/libs/extract'
import type { StateVod, StateInfo } from '@/ncoverlay/state'

import { GOOGLE_FORMS_URL, GOOGLE_FORMS_IDS } from '@/constants'
import { VODS } from '@/constants/vods'
import { webext } from '@/utils/webext'
import get from '@/utils/get-value'

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

type Maybe<T> = T | null | undefined
type NestedKeyOf<T extends Record<string, unknown>> = {
  [K in keyof T & string]: T[K] extends Maybe<Record<string, unknown>>
    ? T[K] extends Maybe<Record<string, unknown>>
      ? `${K}.${NestedKeyOf<NonNullable<T[K]>>}`
      : K
    : K
}[keyof T & string]

type ExtractedResultNestedKey =
  | NestedKeyOf<ExtractedResultSingleEpisode>
  | NestedKeyOf<ExtractedResultMultipleEpisodes>

const EXTRACTED_RESULT_NESTED_KEYS: ExtractedResultNestedKey[] = [
  'input',

  'title',
  'titleStripped',

  'season.text',
  'season.number',
  'season.prefix',
  'season.numberText',
  'season.suffix',
  'season.indices',

  'seasonAlt.text',
  'seasonAlt.number',
  'seasonAlt.prefix',
  'seasonAlt.numberText',
  'seasonAlt.suffix',
  'seasonAlt.indices',

  'episode.text',
  'episode.number',
  'episode.prefix',
  'episode.numberText',
  'episode.suffix',
  'episode.indices',

  'episodeAlt.text',
  'episodeAlt.number',
  'episodeAlt.prefix',
  'episodeAlt.numberText',
  'episodeAlt.suffix',
  'episodeAlt.indices',

  'episodes',
  'episodesDivider',

  'subtitle',
  'subtitleStripped',
]

function formatEpisodes(input: ExtractedResultMultipleEpisodes): string {
  const { episodes, episodesDivider } = input

  if (!episodes || !episodesDivider) return ''

  const text = episodes.map((v) => JSON.stringify(v.text))
  const number = episodes.map((v) => v.number)
  const numberText = episodes.map((v) => JSON.stringify(v.numberText))
  const indices = episodes.map((v) => `[${v.indices.join(', ')}]`)

  return [
    `episodes.text: [${text.join(', ')}]`,
    `episodes.number: [${number.join(', ')}]`,
    `episodes.numberText: [${numberText.join(', ')}]`,
    `episodes.indices: [${indices.join(', ')}]`,
  ].join('\n')
}

function formatKeyValue(input: ExtractedResult, key: string): string | null {
  const val = get(input, key)

  if (val == null || val === '') return null

  if (key.endsWith('.indices')) {
    return `${key}: [${(val as []).join(', ')}]`
  }

  if (key === 'episodes' && !input.isSingleEpisode) {
    return formatEpisodes(input)
  }

  return `${key}: ${JSON.stringify(val)}`
}

export async function getFormsUrl({
  content,
  vod,
  info,
  url,
}: {
  content?: keyof typeof CONTENTS
  vod?: StateVod | null
  info?: StateInfo | null
  url?: string | null
} = {}) {
  const { version } = webext.runtime.getManifest()
  const { os } = await webext.runtime.getPlatformInfo()

  const osName = OS_NAMES[os]

  const formUrl = new URL(GOOGLE_FORMS_URL)

  formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.VERSION}`, version)

  if (osName) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.OS}`, osName)
  }

  if (webext.isChrome) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Chrome')
  } else if (webext.isFirefox) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.BROWSER}`, 'Firefox')
  }

  if (content) {
    formUrl.searchParams.set(
      `entry.${GOOGLE_FORMS_IDS.CONTENT}`,
      CONTENTS[content]
    )
  }

  if (vod) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.VODS}`, VODS[vod])
  }

  const input = info?.input

  const inputText =
    input &&
    [
      ...(typeof input === 'string'
        ? [`input: ${JSON.stringify(input)}`]
        : EXTRACTED_RESULT_NESTED_KEYS.map((key) =>
            formatKeyValue(input, key)
          )),
      `duration: ${info.duration}`,
    ]
      .filter(Boolean)
      .join('\n')

  const title = [url, inputText].filter(Boolean).join('\n\n').trim()

  if (title) {
    formUrl.searchParams.set(`entry.${GOOGLE_FORMS_IDS.TITLE}`, title)
  }

  return formUrl.href
}
