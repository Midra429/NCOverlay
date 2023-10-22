import { normalize } from '../normalize'
import { season } from './season'
import { episodeNumber } from './episodeNumber'

/**
 * タイトルを検索用に最適化させる (半角に統一 & スペース除去 & 括弧除去 & 話数の表記統一)
 * @param title タイトル
 * @returns 共通化したタイトル
 */
export const title = (title: string): string => {
  if (title) {
    // テキストを共通化
    title = normalize.text(title)
    // シーズン表記を検索用に最適化
    title = season(title)
    // 話数表記を検索用に最適化
    title = episodeNumber(title)
    // 連続した空白を1文字に
    title = title.replace(/\s+/g, ' ').trim()

    return title
  }

  return ''
}
