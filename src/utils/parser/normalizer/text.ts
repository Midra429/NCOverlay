import { fullWidthToHalfWidth } from '../converter/fullWidthToHalfWidth'
import { romanNum } from './romanNum'
import { space } from './space'
import { symbol } from './symbol'

export const text = (
  str: string,
  option: {
    /** オプション全て */
    all?: boolean
    /** 括弧除去 */
    bracket?: boolean
    /** スペース除去 */
    space?: boolean
    /** アニメ特有の要素除去 */
    anime?: boolean
  } = {}
): string => {
  str = str.trim()

  // 全角 → 半角
  str = fullWidthToHalfWidth(str)

  // 空白
  str = space(str)
  // 記号
  str = symbol(str)
  // ローマ数字
  str = romanNum(str)

  // 小文字
  str = str.toLowerCase()

  // 括弧除去
  if (option.bracket || option.all) {
    str = str.replace(/[\-~\|\(\)｢｣「」『』【】〈〉《》〔〕{}\[\]]/g, ' ')
  }

  // アニメ特有の要素除去
  if (option.anime || option.all) {
    str = str.replace(/^(TV|テレビ)?アニメ(ーション)?\s/i, '')
    str = str.replace(/\s本編$/, '')
  }

  // スペース除去
  if (option.space || option.all) {
    str = str.replace(/\s/g, '')
  }
  // 連続したスペースを1文字に
  else {
    str = str.replace(/\s+/g, ' ').trim()
  }

  return str
}
