import { normalizeText } from './normalizeText'
import { normalizeEpisodeNumber } from './normalizeEpisodeNumber'

export const normalizeTitle = (title: string) => {
  title = normalizeText(title)
  title = normalizeEpisodeNumber(title)
  title = title.replace(/\s+/g, '').trim()

  return title
}
