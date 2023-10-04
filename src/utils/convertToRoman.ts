/**
 * 数字をローマ数字に変換
 * @param num 数字
 * @returns ローマ数字
 */
export const convertToRoman = (num: number): string => {
  const decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  const romanNumeral = [
    'M',
    'CM',
    'D',
    'CD',
    'C',
    'XC',
    'L',
    'XL',
    'X',
    'IX',
    'V',
    'IV',
    'I',
  ]

  let result = ''

  decimal.forEach((val, idx) => {
    while (val <= num) {
      result += romanNumeral[idx]
      num -= val
    }
  })

  return result || num.toString()
}
