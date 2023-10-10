import { zeroPadding } from './zeroPadding'

export const formatDuration = (seconds: number): string => {
  const hour = Math.floor(seconds / 3600)
  const min = zeroPadding(Math.floor(seconds / 60), 2)
  const sec = zeroPadding(Math.floor(seconds % 60), 2)

  return `${hour ? `${hour}:` : ''}${min}:${sec}`
}
