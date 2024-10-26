import type { VodKey, PluginKey, SettingsInitData } from '@/types/constants'
import type { JikkyoChannelId } from '@midra/nco-api/types/constants'

import {
  SunMoonIcon,
  SunIcon,
  MoonIcon,
  SlidersHorizontalIcon,
  MessageSquareTextIcon,
  MessageSquareOffIcon,
  BlocksIcon,
  KeyboardIcon,
} from 'lucide-react'
import { JIKKYO_CHANNELS } from '@midra/nco-api/constants'

import { VODS } from '@/constants/vods'
import { PLUGINS } from '@/constants/plugins'

/** 設定画面の初期化データ */
export const SETTINGS_INIT_DATA: SettingsInitData = [
  {
    id: 'general',
    title: '全般',
    icon: SlidersHorizontalIcon,
    items: [
      {
        settingsKey: 'settings:theme',
        inputType: 'select',
        label: 'テーマ',
        options: [
          {
            label: '自動',
            value: 'auto',
            icon: SunMoonIcon,
          },
          {
            label: 'ライト',
            value: 'light',
            icon: SunIcon,
          },
          {
            label: 'ダーク',
            value: 'dark',
            icon: MoonIcon,
          },
        ],
      },
      {
        settingsKey: 'settings:vods',
        inputType: 'checkbox',
        label: '動画配信サービス',
        description: '選択した動画配信サービスで\n拡張機能を有効にします。',
        options: Object.entries(VODS).map(([key, value]) => ({
          label: value,
          value: key as VodKey,
        })),
      },
      {
        settingsKey: 'settings:capture:format',
        inputType: 'select',
        label: 'キャプチャー: 形式',
        options: [
          { label: 'JPEG', value: 'jpeg' },
          { label: 'PNG', value: 'png' },
        ],
      },
      {
        settingsKey: 'settings:capture:method',
        inputType: 'select',
        label: 'キャプチャー: 方式',
        options: [
          { label: 'ウィンドウ', value: 'window' },
          { label: 'コピー', value: 'copy' },
        ],
      },
      {
        settingsKey: 'settings:showChangelog',
        inputType: 'toggle',
        label: '更新内容を表示',
        description: 'アップデート後に更新内容を新しいタブで開きます。',
      },
    ],
  },
  {
    id: 'comment',
    title: 'コメント',
    icon: MessageSquareTextIcon,
    items: [
      {
        settingsKey: 'settings:comment:fps',
        inputType: 'select',
        label: 'フレームレート',
        options: [
          { label: '30fps', value: 30 },
          { label: '60fps', value: 60 },
          { label: '無制限', value: 0 },
        ],
      },
      {
        settingsKey: 'settings:comment:opacity',
        inputType: 'range',
        label: '不透明度',
        min: 0,
        max: 100,
        step: 5,
        suffix: '%',
      },
      {
        settingsKey: 'settings:comment:scale',
        inputType: 'range',
        label: '表示サイズ',
        min: 50,
        max: 100,
        step: 10,
        suffix: '%',
      },
      {
        settingsKey: 'settings:comment:amount',
        inputType: 'range',
        label: '表示量',
        description:
          'コメント数の目安: 2倍(2,000) 〜 10倍(10,000)\n倍率が高くなるほど取得に時間がかかります。',
        min: 1,
        max: 10,
        step: 1,
        suffix: '倍',
      },
      {
        settingsKey: 'settings:comment:autoLoads',
        inputType: 'checkbox',
        label: '自動検索',
        options: [
          { label: '公式', value: 'official' },
          { label: 'dアニメ', value: 'danime' },
          { label: 'dアニメ(分割)', value: 'chapter' },
          { label: 'コメント専用', value: 'szbh' },
          { label: '実況(過去ログ)', value: 'jikkyo' },
        ],
      },
      {
        settingsKey: 'settings:comment:jikkyoChannelIds',
        inputType: 'ch-selector',
        label: '自動検索: 実況チャンネル',
        options: Object.entries(JIKKYO_CHANNELS).map(([id, val]) => ({
          label: `${id}: ${val}`,
          value: id as JikkyoChannelId,
        })),
      },
      {
        settingsKey: 'settings:comment:useNiconicoCredentials',
        inputType: 'toggle',
        label: 'ニコニコのログイン情報を使用',
        description:
          'ON: ニコニコのNG設定が反映される\nOFF: ニコニコに視聴履歴を反映させない',
      },
    ],
  },
  {
    id: 'ng',
    title: 'NG設定',
    icon: MessageSquareOffIcon,
    items: [
      {
        settingsKey: 'settings:ng:words',
        inputType: 'ng-list',
        label: 'コメント',
      },
      {
        settingsKey: 'settings:ng:commands',
        inputType: 'ng-list',
        label: 'コマンド',
      },
      {
        settingsKey: 'settings:ng:ids',
        inputType: 'ng-list',
        label: 'ユーザーID',
      },
      {
        settingsKey: 'settings:ng:largeComments',
        inputType: 'toggle',
        label: 'サイズの大きいコメントを非表示',
        description: '「big」コマンドを含むコメントを非表示にします。',
      },
      {
        settingsKey: 'settings:ng:fixedComments',
        inputType: 'toggle',
        label: '固定コメントを非表示',
        description: '「ue」「shita」コマンドを含むコメントを非表示にします。',
      },
      {
        settingsKey: 'settings:ng:coloredComments',
        inputType: 'toggle',
        label: '色付きコメントを非表示',
        description: '色指定コマンドを含むコメントを非表示にします。',
      },
    ],
  },
  {
    id: 'keyboard',
    title: 'キーボード',
    icon: KeyboardIcon,
    items: [
      {
        settingsKey: 'settings:kbd:increaseGlobalOffset',
        inputType: 'kbd-shortcut',
        label: '全体のオフセットを増やす (+1s)',
      },
      {
        settingsKey: 'settings:kbd:decreaseGlobalOffset',
        inputType: 'kbd-shortcut',
        label: '全体のオフセットを減らす (-1s)',
      },
      {
        settingsKey: 'settings:kbd:resetGlobalOffset',
        inputType: 'kbd-shortcut',
        label: '全体のオフセットをリセットする',
      },
      {
        settingsKey: 'settings:kbd:jumpMarkerToStart',
        inputType: 'kbd-shortcut',
        label: '「ｷﾀ-（開始）」にジャンプ',
      },
      {
        settingsKey: 'settings:kbd:jumpMarkerToOP',
        inputType: 'kbd-shortcut',
        label: '「OP（オープニング）」にジャンプ',
      },
      {
        settingsKey: 'settings:kbd:jumpMarkerToA',
        inputType: 'kbd-shortcut',
        label: '「A（Aパート）」にジャンプ',
      },
      {
        settingsKey: 'settings:kbd:jumpMarkerToB',
        inputType: 'kbd-shortcut',
        label: '「B（Bパート）」にジャンプ',
      },
      {
        settingsKey: 'settings:kbd:jumpMarkerToED',
        inputType: 'kbd-shortcut',
        label: '「ED（エンディング）」にジャンプ',
      },
      {
        settingsKey: 'settings:kbd:jumpMarkerToC',
        inputType: 'kbd-shortcut',
        label: '「C（Cパート）」にジャンプ',
      },
      {
        settingsKey: 'settings:kbd:resetMarker',
        inputType: 'kbd-shortcut',
        label: 'オフセットをリセットする',
      },
    ],
  },
  {
    id: 'plugins',
    title: 'プラグイン',
    icon: BlocksIcon,
    items: Object.entries(PLUGINS).map(([key, value]) => ({
      settingsKey: 'settings:plugins',
      inputType: 'checkcard',
      label: VODS[key as VodKey],
      options: value.map((val) => ({
        label: val.title,
        description: 'description' in val ? val.description : undefined,
        value: `${key}:${val.id}` as PluginKey,
      })),
    })),
  },
]
