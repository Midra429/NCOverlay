import type { VodKey } from '@/types/constants'

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

  abema: [
    {
      id: 'windowSizeFullscreen',
      title: 'フルスクリーン (ブラウザサイズ)',
    },
  ],

  bandaiChannel: [
    {
      id: 'windowSizeFullscreen',
      title: 'フルスクリーン (ブラウザサイズ)',
    },
  ],

  tver: [
    {
      id: 'windowSizeFullscreen',
      title: 'フルスクリーン (ブラウザサイズ)',
    },
  ],
} as const satisfies {
  [key in VodKey]?: {
    id: string
    title: string
    description?: string
  }[]
}
