import { normalizeText } from './normalizeText'

export const extractEpisodeNumber = (title: string) => {
  title = normalizeText(title, false)

  return (
    title.match(
      /第?(\d+|[一二三四五六七八九十百千万]+)話|episode(\d+)|#(\d+)/i
    )?.[0] ?? null
  )
}
