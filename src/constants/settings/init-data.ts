import type { JikkyoChannelId } from '@midra/nco-utils/types/api/constants'
import type { PluginKey, SettingsInitData, VodKey } from '@/types/constants'

import {
  BlocksIcon,
  KeyboardIcon,
  MessageSquareOffIcon,
  MessageSquareTextIcon,
  MoonIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  SunIcon,
  SunMoonIcon,
} from 'lucide-react'
import { JIKKYO_CHANNELS } from '@midra/nco-utils/api/constants'

import { PLUGINS } from '@/constants/plugins'
import { VODS } from '@/constants/vods'
import { SUPPORTED_VOD_KEYS } from '@/utils/api/jikkyo/findChapters'

import { AUTO_SEARCH_TARGET_KEYS, SOURCE_NAMES } from '.'

/** 設定画面の初期化データ */
export const SETTINGS_INIT_DATA: SettingsInitData = [
  {
    title: '全般',
    Icon: SlidersHorizontalIcon,
    items: [
      {
        settingsKey: 'settings:theme',
        inputType: 'select',
        label: 'テーマ',
        options: [
          {
            label: '自動',
            value: 'auto',
            Icon: SunMoonIcon,
          },
          {
            label: 'ライト',
            value: 'light',
            Icon: SunIcon,
          },
          {
            label: 'ダーク',
            value: 'dark',
            Icon: MoonIcon,
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
        label: 'キャプチャ: 形式',
        options: [
          { label: 'JPEG', value: 'jpeg' },
          { label: 'PNG', value: 'png' },
        ],
      },
      {
        settingsKey: 'settings:capture:method',
        inputType: 'select',
        label: 'キャプチャ: 方式',
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
      {
        settingsKey: 'settings:showKawaiiPct',
        inputType: 'toggle',
        label: 'かわいい率を表示',
        description:
          'コメント数の右側にかわいい率(かわいいの出現率)を表示します。',
      },
    ],
  },

  {
    title: 'コメント',
    Icon: MessageSquareTextIcon,
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
        description: [
          'コメント数の目安: 2倍(2,000) 〜 10倍(10,000)',
          '※倍率が高くなるほど取得に時間がかかったり、エラーが発生する可能性が高くなります。',
        ].join('\n'),
        min: 1,
        max: 10,
        step: 1,
        suffix: '倍',
        disable: {
          when: [
            {
              key: 'settings:comment:useNiconicoCredentials',
              value: false,
            },
          ],
        },
      },
      {
        settingsKey: 'settings:comment:useNiconicoCredentials',
        inputType: 'toggle',
        label: 'ニコニコのログイン情報を使用',
        description: [
          'ON: ニコニコのNG設定が反映される',
          'OFF: ニコニコに視聴履歴を反映させない',
        ].join('\n'),
      },
      {
        settingsKey: 'settings:comment:hideAssistedComments',
        inputType: 'toggle',
        label: 'コメントアシストの表示を抑制',
        description: [
          'コメントアシスト機能を使用したと予想されるコメントの表示を抑制します。',
          '※正確には判定できないので、テンプレコメントも対象になる可能性があります',
        ].join('\n'),
      },
      {
        settingsKey: 'settings:comment:adjustJikkyoOffset',
        inputType: 'toggle',
        label: '実況: オフセット自動調節 (β)',
        description: [
          'OP/EDスキップ機能のデータとコメントを元に、自動で提供やCM部分をカットします。',
          '※EDと次回予告の間のCMはカットできません',
          '※コメントの内容や数に依存するため、不正確な可能性があります',
          '',
          '[対応動画配信サービス]',
          SUPPORTED_VOD_KEYS.map((v) => VODS[v]).join(', '),
        ].join('\n'),
      },
    ],
  },

  {
    title: '自動検索',
    Icon: SearchIcon,
    items: [
      {
        settingsKey: 'settings:autoSearch:targets',
        inputType: 'checkbox',
        label: '検索対象',
        description: `${VODS.nhkPlus}は「実況」のみ`,
        options: AUTO_SEARCH_TARGET_KEYS.map((key) => ({
          label: SOURCE_NAMES[key],
          value: key,
        })),
      },
      {
        settingsKey: 'settings:autoSearch:jikkyoChannelIds',
        inputType: 'ch-selector',
        label: '実況: チャンネル',
        options: Object.entries(JIKKYO_CHANNELS).map(([id, val]) => ({
          label: `${id}: ${val}`,
          value: id as JikkyoChannelId,
        })),
      },
      {
        settingsKey: 'settings:autoSearch:jikkyoOnlyAdjustable',
        inputType: 'toggle',
        label: '実況: オフセット自動調節可のみ',
        description: 'オフセット自動調節ができる過去ログのみを表示します。',
        disable: {
          when: [
            {
              key: 'settings:comment:adjustJikkyoOffset',
              value: false,
            },
          ],
        },
      },
      {
        settingsKey: 'settings:autoSearch:manual',
        inputType: 'toggle',
        label: '手動で実行',
        description: [
          '再生時に自動検索を実行しないようにします。',
          'ポップアップの自動検索(再読み込み)ボタンを押すと実行されます。',
        ].join('\n'),
      },
    ],
  },

  {
    title: 'NG設定',
    Icon: MessageSquareOffIcon,
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
    title: 'キーボード',
    Icon: KeyboardIcon,
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
    title: 'プラグイン',
    Icon: BlocksIcon,
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
