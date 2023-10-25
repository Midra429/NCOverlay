import { EPISODE_NUMBER_REGEXP } from '@/constants'
import { kanji2number } from '@geolonia/japanese-numeral'
import { normalize } from './normalize'

export const extractEpisodeNumber = (title: string) => {
  title = normalize.text(title)

  const matched = title.match(EPISODE_NUMBER_REGEXP)

  if (matched) {
    let num = Number(matched[1] || matched[2] || matched[3])
    if (Number.isNaN(num)) {
      num = kanji2number(matched[1])
    }

    if (Number.isFinite(num)) {
      return num
    }
  }

  return null
}
