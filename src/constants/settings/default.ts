import type { JikkyoChannelId } from '@midra/nco-api/types/constants'
import type { SettingItems } from '@/types/storage'

import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'
import { VOD_KEYS } from '../vods'

/** 設定のデフォルト値 */
export const SETTINGS_DEFAULT: SettingItems = {
  // 全般
  'settings:theme': 'auto',
  'settings:showChangelog': true,

  // 動画配信サービス
  'settings:vods': [...VOD_KEYS.filter((v) => v !== 'niconico')],

  // キャプチャー
  'settings:capture:format': 'jpeg',
  'settings:capture:method': 'window',

  // コメント
  'settings:comment:fps': 60,
  'settings:comment:opacity': 100,
  'settings:comment:scale': 100,
  'settings:comment:amount': 1,
  'settings:comment:autoLoads': ['official', 'danime', 'chapter'],
  'settings:comment:useNiconicoCredentials': true,
  'settings:comment:jikkyoChannelIds': Object.keys(
    JIKKYO_CHANNELS
  ) as JikkyoChannelId[],

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
}
