import { convertToRoman } from './convertToRoman'

/**
 * ローマ数字の表記を統一
 * @param str ローマ数字が含まれた文字列
 * @returns 統一化した文字列
 */
export const fixRomanNum = (str: string): string => {
  const ronamNum = [
    null,
    'ⅰ',
    'ⅱ',
    'ⅲ',
    'ⅳ',
    'ⅴ',
    'ⅵ',
    'ⅶ',
    'ⅷ',
    'ⅸ',
    'ⅹ',
    'ⅺ',
    'ⅻ',
  ]

  return str.replace(/[ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅺⅻ]/, (char) => {
    const idx = ronamNum.indexOf(char)
    return idx !== -1 ? convertToRoman(idx).toLowerCase() : char
  })
}
