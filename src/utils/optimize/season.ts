/**
 * シーズン表記を検索用に最適化する
 * @param title タイトル
 * @returns シーズン表記を最適化したタイトル
 */
export const season = (title: string) => {
  title = title.replace(/シーズン(\d+)|season(\d+)/gi, (_, p1, p2) => {
    const num = Number(p1 || p2)

    return ` シーズン${num} OR Season${num} `
  })

  return title
}
