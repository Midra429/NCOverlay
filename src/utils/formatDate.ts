import { zeroPadding } from './zeroPadding'

export const formatDate = (date: string | Date) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  if (Number.isNaN(date.getTime())) {
    return '----/--/-- --:--'
  }

  let result = `${date.getFullYear()}/${zeroPadding(
    date.getMonth() + 1,
    2
  )}/${zeroPadding(date.getDate(), 2)}`
  result += ` ${zeroPadding(date.getHours(), 2)}:${zeroPadding(
    date.getMinutes(),
    2
  )}`

  return result
}
