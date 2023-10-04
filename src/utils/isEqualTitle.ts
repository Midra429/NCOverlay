import { normalizeTitle } from './normalizeTitle'

/**
 * 2つのタイトルを比較して一致するかどうか(表記ゆれ対応)
 */
export const isEqualTitle = (titleA: string, titleB: string): boolean => {
  let result = false

  if (titleA && titleB) {
    result = titleA === titleB

    if (!result) {
      result = normalizeTitle(titleA) === normalizeTitle(titleB)
    }
  }

  return result
}
