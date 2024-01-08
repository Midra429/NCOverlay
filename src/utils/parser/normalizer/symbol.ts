const hyphens = [
  // ハイフン
  0x2010, 0x002d, 0xff0d, 0x00ad, 0x2011, 0x2012, 0x2212, 0x2013, 0x2043,
  0x06d4, 0x2796, 0x02d7, 0xfe58, 0x2cba, 0x2014, 0x2015, 0x2e3a,
]

const tildes = [
  // チルダ
  0x007e, 0x02dc, 0x02f7, 0x0303, 0x0330, 0x0334, 0x223c, 0xff5e,
  // 波ダッシュ
  0x301c, 0x1fc0, 0x2053, 0x223f, 0x3030,
]

const apostrophes = [
  // アポストロフィ
  0x0027, 0xff40, 0x0384, 0xff07, 0x02c8, 0x02ca, 0x144a, 0x02cb, 0xa78c,
  0x16cc, 0x16f52, 0x16f51, 0x2018, 0x2019, 0x05d9, 0x055a, 0x201b, 0x055d,
  0x0060, 0x1fef, 0x2032, 0x05f3, 0x00b4, 0x0374, 0x02f4, 0x07f4, 0x2035,
  0x07f5, 0x02b9, 0x02bb, 0x02bc, 0x1ffd, 0x1fbd, 0x02bd, 0x1ffe, 0x02be,
  0x1fbf,
]

const quotations = [
  // クォーテーション
  0x0022, 0xff02, 0x3003, 0x02ee, 0x05f2, 0x1cd3, 0x2033, 0x05f4, 0x2036,
  0x02f6, 0x02ba, 0x201c, 0x201d, 0x02dd, 0x201f,
]

const dots = [
  // ドット
  0x00b7, 0x2022, 0xff65, 0x22c5, 0x0387, 0x2027, 0x1427, 0x16eb, 0xa78f,
  0x2e31, 0x2219, 0x10101, 0x30fb,
]

const exclamations = [
  // エクスクラメーション
  0x0021, 0x2d51, 0x01c3, 0xff01,
]

const slashes = [
  // スラッシュ
  0x002f, 0x2044, 0x2cc6, 0x27cb, 0x2571, 0x1735, 0x2215, 0x29f8,
]

export const CODE_POINTS = {
  HYPHEN: '-'.codePointAt(0)!,
  TILDE: '~'.codePointAt(0)!,
  APOSTROPHE: "'".codePointAt(0)!,
  QUOTATION: '”'.codePointAt(0)!,
  DOT: '･'.codePointAt(0)!,
  EXCLAMATION: '!'.codePointAt(0)!,
  SLASH: '/'.codePointAt(0)!,
}

/**
 * 記号を統一
 */
export const symbol = (str: string): string => {
  const result = new Array(str.length)

  for (let i = 0; i < str.length; i++) {
    let cp = str.codePointAt(i)!

    // ハイフン
    if (hyphens.includes(cp)) {
      cp = CODE_POINTS.HYPHEN
    }

    // チルダ
    if (tildes.includes(cp)) {
      cp = CODE_POINTS.TILDE
    }

    // アポストロフィ
    if (apostrophes.includes(cp)) {
      cp = CODE_POINTS.APOSTROPHE
    }

    // クォーテーション
    if (quotations.includes(cp)) {
      cp = CODE_POINTS.QUOTATION
    }

    // ドット
    if (dots.includes(cp)) {
      cp = CODE_POINTS.DOT
    }

    // エクスクラメーション
    if (exclamations.includes(cp)) {
      cp = CODE_POINTS.EXCLAMATION
    }

    // スラッシュ
    if (slashes.includes(cp)) {
      cp = CODE_POINTS.SLASH
    }

    result[i] = String.fromCodePoint(cp)
  }

  return result.join('')
}
