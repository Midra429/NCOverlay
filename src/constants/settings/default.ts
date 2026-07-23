import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { SettingItems, SettingsKey } from '@/types/storage'

import { JIKKYO_CHANNELS } from '@midra/nco-utils/api/constants'

import { VOD_KEYS } from '../vods'

/** 設定のデフォルト値 */
export const SETTINGS_DEFAULT: SettingItems = {
  // 全般
  theme: 'auto',
  vods: [...VOD_KEYS.filter((v) => !v.startsWith('_') && v !== 'niconico')],
  'capture:format': 'jpeg',
  'capture:method': 'window',
  showChangelog: true,
  showKawaiiPct: false,

  // コメント
  'comment:fps': 60,
  'comment:opacity': 100,
  'comment:scale': 100,
  'comment:speed': 1,
  'comment:customize': {},
  'comment:amount': 1,
  'comment:useNiconicoCredentials': true,
  'comment:hideAssistedComments': false,
  'comment:adjustJikkyoOffset': false,

  // 自動検索
  'autoSearch:targets': ['official', 'danime', 'chapter'],
  'autoSearch:jikkyoChannelIds': Object.keys(
    JIKKYO_CHANNELS
  ) as JikkyoChannelId[],
  'autoSearch:jikkyoIgnoreRerun': false,
  'autoSearch:jikkyoOnlyAdjustable': true,
  'autoSearch:manual': false,

  // NG設定
  'ng:words': [],
  'ng:commands': [],
  'ng:ids': [],
  'ng:largeComments': false,
  'ng:fixedComments': false,
  'ng:coloredComments': false,
  'ng:sharingLevel': 'none',

  // キーボード
  'kbd:toggleDisplayComment': '',
  'kbd:increaseGlobalOffset': '',
  'kbd:decreaseGlobalOffset': '',
  'kbd:resetGlobalOffset': '',
  'kbd:jumpMarkerToStart': '',
  'kbd:jumpMarkerToOP': '',
  'kbd:jumpMarkerToA': '',
  'kbd:jumpMarkerToB': '',
  'kbd:jumpMarkerToED': '',
  'kbd:jumpMarkerToC': '',
  'kbd:resetMarker': '',

  // プラグイン
  plugins: [],

  // 検索 (設定には非表示)
  'search:sort': '-startTime',
  'search:dateRange': [null, null],
  'search:genre': 'アニメ',
  'search:lengthRange': [null, null],

  // コメントリスト (設定には非表示)
  'commentList:smoothScrolling': false,
  'commentList:showPositionControl': true,
}

export const SETTINGS_DEFAULT_KEYS = Object.keys(
  SETTINGS_DEFAULT
) as SettingsKey[]
