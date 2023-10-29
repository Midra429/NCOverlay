import { numToRoman } from '../converter/numToRoman'

const decimalLCDM = [50, 100, 500, 1000]

/**
 * ローマ数字専用の符号 → ラテン文字に統一
 */
export const romanNum = (str: string): string => {
  const result = new Array(str.length)

  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i)!

    const isRomanNumUpper = 0x2160 <= cp && cp <= 0x216f
    const isRomanNumLower = 0x2170 <= cp && cp <= 0x217f

    let num = 0

    if (isRomanNumUpper) {
      // Ⅰ 〜 Ⅻ
      if (cp <= 0x216b) {
        num = cp - 0x2160 + 1
      }
      // Ⅼ 〜 Ⅿ
      else if (0x216c <= cp) {
        num = decimalLCDM[cp - 0x216c]
      }
    }

    if (isRomanNumLower) {
      // ⅰ 〜 ⅻ
      if (cp <= 0x217b) {
        num = cp - 0x2170 + 1
      }
      // ⅼ 〜 ⅿ
      else if (0x217c <= cp) {
        num = decimalLCDM[cp - 0x217c]
      }
    }

    if (0 < num) {
      result[i] = numToRoman(num, isRomanNumLower)
    } else {
      result[i] = str[i]
    }
  }

  return result.join('')
}
