import type {
  VodKey,
  PluginKey,
  PluginVodKey,
  SettingsInitData,
  SettingsInitItem,
} from '@/types/constants'
import type { StorageItems, SettingsKey } from '@/types/storage'

import {
  SunMoonIcon,
  SunIcon,
  MoonIcon,
  SlidersHorizontalIcon,
  MessageSquareTextIcon,
  MessageSquareOffIcon,
  BlocksIcon,
} from 'lucide-react'

/** GitHub */
export const GITHUB_URL = 'https://github.com/Midra429/NCOverlay'

/** その他のリンク */
export const LINKS: {
  title: string
  label: string
  url: string
}[] = [
  {
    title: 'X (Twitter)',
    label: '@Midra429',
    url: 'https://u.midra.me/x',
  },
  {
    title: 'Amazon',
    label: 'ほしい物リスト',
    url: 'https://u.midra.me/wishlist',
  },
  {
    title: 'giftee',
    label: 'ほしいものリスト',
    url: 'https://u.midra.me/giftee',
  },
]

/** Google フォーム */
export const GOOGLE_FORMS_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSerDl7pYEmaXv0_bBMDOT2DfJllzP1kdesDIRaDBM8sOAzHGw/viewform'

/** `?entry.ID=VALUE&` */
export const GOOGLE_FORMS_IDS = {
  CONTENT: '1500638079',
  VERSION: '412681801',
  OS: '994779637',
  BROWSER: '104404822',
  VODS: '1382689804',
  TITLE: '2044762585',
} as const

/** 動画配信サービス */
export const VODS = {
  dAnime: 'dアニメストア',
  abema: 'ABEMA',
  bandaiChannel: 'バンダイチャンネル',
  dmmTv: 'DMM TV',
  unext: 'U-NEXT',
  fod: 'FOD',
  // lemino: 'Lemino',
  primeVideo: 'Prime Video',
  // netflix: 'Netflix',
  hulu: 'Hulu',
  // disneyPlus: 'Disney+',
  tver: 'TVer',
  // nhkplus: 'NHKプラス',
} as const

/** プラグイン */
export const PLUGINS = {
  dAnime: [
    {
      id: 'disablePopupPlayer',
      title: 'ポップアップ無効化',
      description: 'プレイヤーを新しいタブで開くようにします。',
    },
    // {
    //   id: 'showCommentCounter',
    //   title: 'コメントカウンター',
    //   description: 'サムネイル上にコメント数を表示します。',
    // },
  ],
} as const

/**
 * マーカー
 */
export const MARKERS: {
  label: string
  shortLabel: string
  regexp: RegExp
}[] = [
  {
    label: 'オープニング',
    shortLabel: 'OP',
    regexp: /^(OP|ＯＰ)$/i,
  },
  {
    label: 'Aパート',
    shortLabel: 'A',
    regexp: /^(A|Ａ)$/,
  },
  {
    label: 'Bパート',
    shortLabel: 'B',
    regexp: /^(B|Ｂ)$/,
  },
  {
    label: 'Cパート',
    shortLabel: 'C',
    regexp: /^(C|Ｃ)$/,
  },
]

/** 設定のデフォルト値 */
export const SETTINGS_DEFAULT: {
  [key in SettingsKey]: StorageItems[key]
} = {
  // 全般
  'settings:theme': 'auto',
  'settings:showChangelog': true,

  // 動画配信サービス
  'settings:vods': Object.keys(VODS) as VodKey[],

  // キャプチャー
  'settings:capture:format': 'jpeg',
  'settings:capture:method': 'window',

  // コメント
  'settings:comment:autoLoad': true,
  'settings:comment:autoLoadChapter': true,
  'settings:comment:autoLoadSzbh': true,
  'settings:comment:autoLoadJikkyo': true,
  'settings:comment:useNglist': false,
  'settings:comment:amount': 1,
  'settings:comment:opacity': 100,
  'settings:comment:scale': 100,
  'settings:comment:fps': 60,

  // NG設定
  'settings:ng:largeComments': false,
  'settings:ng:fixedComments': false,
  'settings:ng:coloredComments': false,
  'settings:ng:word': [],
  'settings:ng:command': [],
  'settings:ng:id': [],

  // プラグイン
  'settings:plugins': [],
} as const

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
            value: 'auto',
            label: '自動',
            icon: SunMoonIcon,
          },
          {
            value: 'light',
            label: 'ライト',
            icon: SunIcon,
          },
          {
            value: 'dark',
            label: 'ダーク',
            icon: MoonIcon,
          },
        ],
      },
      {
        settingsKey: 'settings:vods',
        inputType: 'checkbox',
        label: '動画配信サービス',
        description: '選択した動画配信サービスで拡張機能を有効にします。',
        options: (Object.keys(VODS) as VodKey[]).map((key) => ({
          label: VODS[key],
          value: key,
        })),
      },
      {
        settingsKey: 'settings:capture:format',
        inputType: 'select',
        label: 'キャプチャー: 形式',
        options: [
          { value: 'jpeg', label: 'JPEG' },
          { value: 'png', label: 'PNG' },
        ],
      },
      {
        settingsKey: 'settings:capture:method',
        inputType: 'select',
        label: 'キャプチャー: 方式',
        options: [
          { value: 'window', label: 'ウィンドウ' },
          { value: 'copy', label: 'コピー' },
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
        settingsKey: 'settings:comment:autoLoad',
        inputType: 'toggle',
        label: '自動読み込み',
      },
      // {
      //   settingsKey: 'settings:comment:autoLoadChapter',
      //   inputType: 'toggle',
      //   label: '自動: dアニメストア (分割)',
      //   description: '自動読み込みでdアニメストアの分割された動画を含めます。',
      // },
      // {
      //   settingsKey: 'settings:comment:autoLoadSzbh',
      //   inputType: 'toggle',
      //   label: '自動: コメント専用動画',
      //   description: '自動読み込みでコメント専用動画を含めます。',
      // },
      {
        settingsKey: 'settings:comment:autoLoadJikkyo',
        inputType: 'toggle',
        label: '自動: ニコニコ実況',
        description: '自動読み込みでニコニコ実況(過去ログ)を含めます。',
      },
      // {
      //   settingsKey: 'settings:comment:useNglist',
      //   inputType: 'toggle',
      //   label: 'NG設定を使用',
      //   description: 'ログイン中のニコニコアカウントのNG設定を使用します。',
      // },
      // {
      //   settingsKey: 'settings:comment:amount',
      //   inputType: 'range',
      //   label: '表示量',
      //   min: 1,
      //   max: 5,
      //   step: 1,
      //   suffix: '倍',
      // },
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
        settingsKey: 'settings:comment:fps',
        inputType: 'select',
        label: 'フレームレート',
        options: [
          { value: 30, label: '30fps' },
          { value: 60, label: '60fps' },
          { value: 0, label: '無制限' },
        ],
      },
    ],
  },
  {
    id: 'ng',
    title: 'NG設定',
    icon: MessageSquareOffIcon,
    items: [
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
      // {
      //   settingsKey: 'settings:ng:word',
      // },
      // {
      //   settingsKey: 'settings:ng:command',
      // },
      // {
      //   settingsKey: 'settings:ng:id',
      // },
    ],
  },
  {
    id: 'plugins',
    title: 'プラグイン',
    icon: BlocksIcon,
    items: (Object.keys(PLUGINS) as PluginVodKey[]).map((vodKey) => ({
      settingsKey: 'settings:plugins',
      inputType: 'checkcard',
      label: VODS[vodKey],
      options: PLUGINS[vodKey].map(({ id, title, description }) => ({
        label: title,
        description: description,
        value: `${vodKey}:${id}` as PluginKey,
      })),
    })),
  },
]

export const SETTINGS_INIT_ITEMS = Object.fromEntries(
  SETTINGS_INIT_DATA.flatMap((v) => v.items).map((v) => [v.settingsKey, v])
) as {
  [key in SettingsKey]: SettingsInitItem
}

/** ニコニコ コメント コマンド (色) */
export const NICONICO_COLOR_COMMANDS = {
  white: '#FFFFFF',
  red: '#FF0000',
  pink: '#FF8080',
  orange: '#FFC000',
  yellow: '#FFFF00',
  green: '#00FF00',
  cyan: '#00FFFF',
  blue: '#0000FF',
  purple: '#C000FF',
  black: '#000000',
  white2: '#CCCC99',
  niconicowhite: '#CCCC99',
  red2: '#CC0033',
  truered: '#CC0033',
  pink2: '#FF33CC',
  orange2: '#FF6600',
  passionorange: '#FF6600',
  yellow2: '#999900',
  madyellow: '#999900',
  green2: '#00CC66',
  elementalgreen: '#00CC66',
  cyan2: '#00CCCC',
  blue2: '#3399FF',
  marinblue: '#3399FF',
  purple2: '#6633CC',
  nobleviolet: '#6633CC',
  black2: '#666666',
}

export const REGEXP_COLOR_CODE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
