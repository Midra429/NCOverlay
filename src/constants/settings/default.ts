import type { SettingItems } from '@/types/storage'

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
  'settings:comment:autoLoads': ['normal', 'chapter'],
  'settings:comment:useNglist': false,
  'settings:comment:amount': 1,
  'settings:comment:opacity': 100,
  'settings:comment:scale': 100,
  'settings:comment:fps': 60,

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
  'settings:kbd:jumpMarkerToOP': '',
  'settings:kbd:jumpMarkerToA': '',
  'settings:kbd:jumpMarkerToB': '',
  'settings:kbd:jumpMarkerToC': '',
  'settings:kbd:resetMarker': '',

  // プラグイン
  'settings:plugins': [],
}
