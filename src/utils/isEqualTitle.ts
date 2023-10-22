import { normalize } from './normalize'

/**
 * 2つのタイトルを比較して一致するかどうか(表記ゆれ対応)
 */
export const isEqualTitle = (titleA: string, titleB: string): boolean => {
  let result = false

  if (titleA && titleB) {
    result = titleA === titleB

    if (!result) {
      result = normalize.title(titleA) === normalize.title(titleB)
    }
  }

  return result
}
