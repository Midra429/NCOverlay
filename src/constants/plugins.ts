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

  niconico: [
    {
      id: 'windowSizeFullscreen',
      title: 'フルスクリーンサイズ: ブラウザ',
      description: 'フルスクリーンをブラウザサイズに強制します。',
    },
  ],
} as const satisfies {
  [key in VodKey]?: {
    id: string
    title: string
    description: string
  }[]
}
