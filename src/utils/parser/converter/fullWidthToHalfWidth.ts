/**
 * 全角 → 半角
 */
export const fullWidthToHalfWidth = (str: string): string => {
  const result = new Array(str.length)

  for (let i = 0; i < str.length; i++) {
    let cp = str.codePointAt(i)!

    if (cp === 0x3000) {
      cp = 0x0020
    } else if (0xff01 <= cp && cp <= 0xff5e) {
      cp -= 0xfee0
    }

    result[i] = String.fromCodePoint(cp)
  }

  return result.join('')
}
