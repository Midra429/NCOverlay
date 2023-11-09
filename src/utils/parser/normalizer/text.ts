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
    str = str
      .replace(/[\-~\|\(\)｢｣「」『』【】〈〉《》〔〕{}\[\]]/g, ' ')
      .trim()
  }

  // アニメ特有の要素除去
  if (option.anime || option.all) {
    str = str.replace(/^(TV|テレビ)?アニメ(ーション)?\s/i, '').trim()
    str = str.replace(/\s本編$/, '').trim()
  }

  // 映画
  str = str.replace(/\s(吹き?替え?|字幕)版?$/, '').trim()

  // 映画タイトル 本編 映画タイトル
  const splited = str.split(/\s本編\s/).map((v) => v.trim())
  if (splited.length === 2 && splited[0] === splited[1]) {
    str = splited[0]
  }

  // コメント専用動画
  str = str.replace(/コメント専用(動画)?|SZBH方式/gi, '').trim()
  str = str.replace(/\sDVD\/Blu[\-\s]?Ray用?$/i, '').trim()

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
