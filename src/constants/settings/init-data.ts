import type { VodKey, PluginKey, SettingsInitData } from '@/types/constants'

import {
  SunMoonIcon,
  SunIcon,
  MoonIcon,
  SlidersHorizontalIcon,
  MessageSquareTextIcon,
  MessageSquareOffIcon,
  BlocksIcon,
  // FlaskConicalIcon,
  KeyboardIcon,
} from 'lucide-react'

import { VODS } from '../vods'
import { PLUGINS } from '../plugins'

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
        description: '選択した動画配信サービスで\n拡張機能を有効にします。',
        options: Object.entries(VODS).map(([key, value]) => ({
          value: key as VodKey,
          label: value,
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
      {
        settingsKey: 'settings:comment:autoLoads',
        inputType: 'checkbox',
        label: '自動検索',
        options: [
          { value: 'normal', label: '通常 / dアニメ' },
          { value: 'chapter', label: 'dアニメ (分割)' },
          { value: 'szbh', label: 'コメント専用' },
          { value: 'jikkyo', label: '実況 (過去ログ)' },
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
  // {
  //   id: 'experimental',
  //   title: '実験機能',
  //   icon: FlaskConicalIcon,
  //   items: [],
  // },
  {
    id: 'plugins',
    title: 'プラグイン',
    icon: BlocksIcon,
    items: Object.entries(PLUGINS).map(([key, value]) => ({
      settingsKey: 'settings:plugins',
      inputType: 'checkcard',
      label: VODS[key as VodKey],
      options: value.map(({ id, title, description }) => ({
        label: title,
        description: description,
        value: `${key}:${id}` as PluginKey,
      })),
    })),
  },
]
