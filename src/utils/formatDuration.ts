import { zeroPadding } from './zeroPadding'

export const formatDuration = (seconds: number): string => {
  return `${zeroPadding(Math.floor(seconds / 60), 2)}:${zeroPadding(
    Math.floor(seconds % 60),
    2
  )}`
}
