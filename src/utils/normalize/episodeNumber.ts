import { EPISODE_NUMBER_REGEXP } from '@/constants'
import { kanji2number } from '@geolonia/japanese-numeral'

export const episodeNumber = (str: string): string => {
  return str.replace(
    new RegExp(EPISODE_NUMBER_REGEXP, 'g'),
    (_, p1, p2, p3) => {
      const num = Number(p1 || p2 || p3)
      if (Number.isFinite(num)) {
        return num.toString()
      } else {
        return kanji2number(p1).toString()
      }
    }
  )
}
