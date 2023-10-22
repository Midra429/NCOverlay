import { text } from './text'
import { season } from './season'
import { episodeNumber } from './episodeNumber'

export const title = (str: string) => {
  str = text(str)
  str = str.replace(/^(tv)?アニメ\s/, '')
  str = str.replace(/\s本編$/, '')
  str = season(str)
  str = episodeNumber(str)
  str = str.replace(/\s+/g, '').trim()

  return str
}
