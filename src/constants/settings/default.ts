import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { SettingItems, SettingsKey } from '@/types/storage'

import { JIKKYO_CHANNELS } from '@midra/nco-utils/api/constants'

import { VOD_KEYS } from '../vods'

/** 設定のデフォルト値 */
export const SETTINGS_DEFAULT: SettingItems = {
  // 全般
  'settings:theme': 'auto',
  'settings:vods': [...VOD_KEYS.filter((v) => v !== 'niconico')],
  'settings:capture:format': 'jpeg',
  'settings:capture:method': 'window',
  'settings:showChangelog': true,
  'settings:showKawaiiPct': false,

  // コメント
  'settings:comment:fps': 60,
  'settings:comment:opacity': 100,
  'settings:comment:scale': 100,
  'settings:comment:speed': 1,
  'settings:comment:customize': {},
  'settings:comment:amount': 1,
  'settings:comment:useNiconicoCredentials': true,
  'settings:comment:hideAssistedComments': false,
  'settings:comment:adjustJikkyoOffset': false,

  // 自動検索
  'settings:autoSearch:targets': ['official', 'danime', 'chapter'],
  'settings:autoSearch:jikkyoChannelIds': Object.keys(
    JIKKYO_CHANNELS
  ) as JikkyoChannelId[],
  'settings:autoSearch:jikkyoOnlyAdjustable': true,
  'settings:autoSearch:manual': false,

  // NG設定
  'settings:ng:words': [],
  'settings:ng:commands': [],
  'settings:ng:ids': [],
  'settings:ng:largeComments': false,
  'settings:ng:fixedComments': false,
  'settings:ng:coloredComments': false,

  // キーボード
  'settings:kbd:increaseGlobalOffset': '',
  'settings:kbd:decreaseGlobalOffset': '',
  'settings:kbd:resetGlobalOffset': '',
  'settings:kbd:jumpMarkerToStart': '',
  'settings:kbd:jumpMarkerToOP': '',
  'settings:kbd:jumpMarkerToA': '',
  'settings:kbd:jumpMarkerToB': '',
  'settings:kbd:jumpMarkerToED': '',
  'settings:kbd:jumpMarkerToC': '',
  'settings:kbd:resetMarker': '',

  // プラグイン
  'settings:plugins': [],

  // 検索 (設定には非表示)
  'settings:search:sort': '-startTime',
  'settings:search:dateRange': [null, null],
  'settings:search:genre': 'アニメ',
  'settings:search:lengthRange': [null, null],

  // コメントリスト (設定には非表示)
  'settings:commentList:smoothScrolling': false,
  'settings:commentList:showPositionControl': true,
}

export const SETTINGS_DEFAULT_KEYS = Object.keys(
  SETTINGS_DEFAULT
) as SettingsKey[]
