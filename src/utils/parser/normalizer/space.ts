const spaces = [
  0x00a0, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009,
  0x200a, 0x200b, 0x2060, 0x3000, 0xfeff, 0x0009,
]
const spaceCodePoint = ' '.codePointAt(0)!

/**
 * スペースを統一
 */
export const space = (str: string): string => {
  const result = new Array(str.length)

  for (let i = 0; i < str.length; i++) {
    let cp = str.codePointAt(i)!

    if (spaces.includes(cp)) {
      cp = spaceCodePoint
    }

    result[i] = String.fromCodePoint(cp)
  }

  return result.join('')
}
