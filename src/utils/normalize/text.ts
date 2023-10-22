import { fixRomanNum } from '../fixRomanNum'

/**
 * テキストを共通化させる (半角に統一 & 余分なスペース除去 & 括弧除去)
 * @param text テキスト
 * @param isLowerCase 小文字にするかどうか
 * @returns 共通化したテキスト
 */
export const text = (text: string, isLowerCase: boolean = true): string => {
  // 英字の大文字を小文字に
  if (isLowerCase) {
    text = text.toLowerCase()
  }
  // ローマ数字を統一
  text = fixRomanNum(text)
  // 全角英数字を半角英数字に
  text = text.replace(/[ａ-ｚ０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  )
  // 記号を全角から半角に
  text = text.replace(
    /./g,
    (s) =>
      ({
        // 「-」に統一
        '−': '-',
        '‒': '-',
        '–': '-',
        '—': '-',
        '―': '-',
        '⸺': '-',

        // 「~」に統一
        '〜': '~',
        '˜': '~',
        '῀': '~',
        '⁓': '~',
        '∼': '~',
        '∿': '~',
        '～': '~',

        '？': '?',
        '！': '!',
        '”': '"',
        '’': "'",
        '´': "'",
        '｀': '`',
        '：': ':',
        '，': ',',
        '．': '.',
        '・': '･',
        '／': '/',
        '＃': '#',
        '＄': '$',
        '％': '%',
        '＆': '&',
        '＝': '=',
        '＠': '@',
      }[s] || s)
  )
  // 括弧・区切りを空白に
  text = text.replace(
    /[\-~\(\)（）｢｣「」『』【】［］〈〉《》〔〕{}｛｝\[\]]/g,
    ' '
  )
  // 連続した空白を1文字に
  text = text.replace(/\s+/g, ' ').trim()

  return text
}
