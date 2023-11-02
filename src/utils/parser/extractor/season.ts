import { core, regExpNum, regExpKansuji } from './core'

export const REGEXP_SEASON = [
  // 第二期 or 二期
  `第?(?<__NAME__>${regExpKansuji})期`,
  // 第2期 or 2期
  `第?(?<__NAME__>${regExpNum})期`,

  // 第二シリーズ
  `第(?<__NAME__>${regExpKansuji})シリーズ`,
  // 第2シリーズ
  `第(?<__NAME__>${regExpNum})シリーズ`,

  // シーズン2
  `シーズン(?<__NAME__>${regExpNum})`,

  // Season 2 or Season2
  `Season\\s?(?<__NAME__>${regExpNum})`,

  // 2nd Season
  `(?<__NAME__>${regExpNum})(st|nd|th)\\sSeason`,
]
  .map((v, i) => v.replace('__NAME__', `_${i}`))
  .join('|')

export const season = (str: string) => {
  return core(str, REGEXP_SEASON)
}
