import { core, regExpNum, regExpKansuji } from './core'

export const REGEXP_EPISODE = [
  // 第一話 or 一話
  `第?(?<__NAME__>${regExpKansuji})話`,
  // 第1話 or 1話
  `第?(?<__NAME__>${regExpNum})話`,
  // Episode 1 or Episode1
  `Episode\\s?(?<__NAME__>${regExpNum})`,
  // #01
  `#(?<__NAME__>${regExpNum})`,
]
  .map((v, i) => v.replace('__NAME__', `_${i}`))
  .join('|')

export const episode = (str: string) => {
  return core(str, REGEXP_EPISODE)
}
