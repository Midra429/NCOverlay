const decimalRomanPair: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

/**
 * 数字 → ローマ数字
 */
export const numToRoman = (num: number, lower: boolean = false): string => {
  const result: string[] = []

  if (1 <= num && num <= 3999) {
    for (const [decimal, roman] of decimalRomanPair) {
      while (decimal <= num) {
        result.push(roman)
        num -= decimal
      }
    }
  }

  return (
    (lower ? result.join('').toLowerCase() : result.join('')) || num.toString()
  )
}
