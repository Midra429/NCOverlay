import { kanji2number } from '@geolonia/japanese-numeral'

export const episodeNumber = (str: string): string => {
  return str.replace(
    /第?(\d+|[一二三四五六七八九十百千万]+)話|episode(\d+)|#(\d+)|\s(\d+)\s/gi,
    (_, p1, p2, p3, p4) => {
      const num = Number(p1 || p2 || p3 || p4)
      if (Number.isFinite(num)) {
        return num.toString()
      } else {
        return kanji2number(p1).toString()
      }
    }
  )
}
