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
    url: 'https://x.com/Midra429',
  },
]

/** Google フォーム */
export const GOOGLE_FORMS_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSerDl7pYEmaXv0_bBMDOT2DfJllzP1kdesDIRaDBM8sOAzHGw/viewform'

/** `?entry.ID=VALUE&` */
export const GOOGLE_FORMS_IDS = {
  VERSION: '412681801',
  OS: '994779637',
  BROWSER: '104404822',
}

/** 動画配信サービス */
export const VODS = {
  dAnime: 'dアニメストア',
  abema: 'ABEMA',
  bandaiChannel: 'バンダイチャンネル',
  dmmTv: 'DMM TV',
  unext: 'U-NEXT',
  lemino: 'Lemino',
  primeVideo: 'Prime Video',
  // netflix: 'Netflix',
  hulu: 'Hulu',
  disneyPlus: 'Disney+',
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
    regexp: /^OP|ＯＰ$/,
  },
  {
    label: 'Aパート',
    shortLabel: 'A',
    regexp: /^A|Ａ$/,
  },
  {
    label: 'Bパート',
    shortLabel: 'B',
    regexp: /^B|Ｂ$/,
  },
  {
    label: 'Cパート',
    shortLabel: 'C',
    regexp: /^C|Ｃ$/,
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

  // コメント
  'settings:comment:autoLoad': true,
  'settings:comment:autoLoadChapter': true,
  'settings:comment:autoLoadSzbh': true,
  'settings:comment:autoLoadJikkyo': true,
  'settings:comment:useNglist': false,
  'settings:comment:amount': 1,
  'settings:comment:scale': 100,
  'settings:comment:opacity': 100,
  'settings:comment:fps': 60,

  // NG設定
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
        settingsKey: 'settings:comment:scale',
        inputType: 'range',
        label: '表示サイズ',
        min: 50,
        max: 100,
        step: 10,
        suffix: '%',
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
        settingsKey: 'settings:comment:fps',
        inputType: 'select',
        label: 'フレームレート',
        options: [
          {
            value: 30,
            label: '30fps',
          },
          {
            value: 60,
            label: '60fps',
          },
          {
            value: 0,
            label: '無制限',
          },
        ],
      },
    ],
  },
  // {
  //   id: 'ng',
  //   title: 'NG設定 (ローカル)',
  //   items: [
  //     {
  //       settingsKey: 'settings:ng:word',
  //     },
  //     {
  //       settingsKey: 'settings:ng:command',
  //     },
  //     {
  //       settingsKey: 'settings:ng:id',
  //     },
  //   ],
  // },
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
