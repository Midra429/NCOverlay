import { kanji2number, number2kanji } from '@geolonia/japanese-numeral'
import { zeroPadding } from './zeroPadding'

/**
 * 話数表記を検索用に最適化する
 * @param title タイトル
 * @returns 話数表記を最適化したタイトル
 */
export const optimizeEpisodeNumberForSearch = (title: string): string => {
  const splitedTitle = title.split(' ')
  if (splitedTitle.length === 3) {
    const num = Number(splitedTitle[1])
    if (Number.isFinite(num)) {
      splitedTitle[1] = `${num}話`
      title = splitedTitle.join(' ')
    }
  }

  title = title.replace(
    /第?(\d+|[一二三四五六七八九十百千万]+)話|episode(\d+)|#(\d+)/gi,
    (_, p1, p2, p3) => {
      let num = Number(p1 || p2 || p3)
      if (Number.isNaN(num)) {
        num = kanji2number(p1)
      }

      const kansuji = number2kanji(num)
      if (num < 10) {
        return ` ${num} OR ${zeroPadding(num, 2)} OR ${kansuji} `
      } else {
        return ` ${num} OR ${kansuji} `
      }
    }
  )

  title = title.replace(/\s+/g, ' ').trim()

  return title
}
