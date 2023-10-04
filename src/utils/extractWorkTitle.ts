import { normalizeText } from './normalizeText'

export const extractWorkTitle = (title: string): string => {
  title = normalizeText(title, false)

  const splitedTitle = title.split(' ')
  if (splitedTitle.length === 3) {
    const num = Number(splitedTitle[1])
    if (Number.isFinite(num)) {
      splitedTitle[1] = `${num}話`
      title = splitedTitle.join(' ')
    }
  }

  title = title.replace(
    /第?(\d+|[一二三四五六七八九十百千万]+)話|episode(\d+)|#(\d+)/gi,
    '__EPISODE_NUMBER__'
  )
  return title.split('__EPISODE_NUMBER__')[0].trim()
}
