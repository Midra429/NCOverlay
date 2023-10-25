import { EPISODE_NUMBER_REGEXP } from '@/constants'
import { kanji2number, number2kanji } from '@geolonia/japanese-numeral'
import { zeroPadding } from '../zeroPadding'

/**
 * 話数表記を検索用に最適化する
 * @param title タイトル
 * @returns 話数表記を最適化したタイトル
 */
export const episodeNumber = (title: string): string => {
  const splitedTitle = title.split(' ')
  if (splitedTitle.length === 3) {
    const num = Number(splitedTitle[1])
    if (Number.isFinite(num)) {
      splitedTitle[1] = `${num}話`
      title = splitedTitle.join(' ')
    }
  }

  title = title.replace(
    new RegExp(EPISODE_NUMBER_REGEXP, 'g'),
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
