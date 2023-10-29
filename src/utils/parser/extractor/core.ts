import { kanji2number } from '@geolonia/japanese-numeral'

export const regExpNum = '\\d+\\.\\d+|\\d+'
export const regExpKansuji = '[〇一二三四五六七八九十百千万]+'

/**
 * @param str 抽出対象の文字列
 * @param regExp 正規表現 (グループ)
 */
export const core = (
  str: string,
  regExp: string | RegExp
): { number: number; text: string }[] => {
  const matches = [...str.matchAll(new RegExp(regExp, 'gi'))]

  return matches
    .map((val) => {
      try {
        const matched = Object.values(val.groups!).find(Boolean)!

        const num = new RegExp(regExpKansuji).test(matched)
          ? kanji2number(matched)
          : Number(matched)

        if (Number.isFinite(num)) {
          return {
            number: num,
            text: val[0],
          }
        }
      } catch {}
    })
    .filter(Boolean) as { number: number; text: string }[]
}
