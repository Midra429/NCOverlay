export const match = (strA: string, strB: string) => {
  const strShort = strA.length < strB.length ? strA : strB
  const strLong = strA.length < strB.length ? strB : strA

  const pct = strLong.match(strShort)
    ? Math.round((strShort.length / strLong.length) * 100)
    : 0

  return Number.isFinite(pct) ? pct : 0
}
