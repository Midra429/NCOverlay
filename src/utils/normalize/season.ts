export const season = (str: string) => {
  return str.replace(/シーズン(\d+)|season(\d+)/gi, (_, p1, p2) => {
    const num = Number(p1 || p2)
    return num.toString()
  })
}
