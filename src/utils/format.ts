import { zeroPadding } from './zeroPadding'

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600

  const minutes = Math.floor(seconds / 60)
  seconds %= 60

  let formatted = ''

  if (hours) {
    formatted += `${zeroPadding(hours, 2)}:`
  }

  formatted += `${zeroPadding(minutes, 2)}:${zeroPadding(seconds, 2)}`

  return formatted
}

export const formatDate = (
  date: Date | number,
  format: string = 'YYYY/MM/DD hh:mm'
) => {
  if (typeof date === 'number') {
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const days = date.getDate()

  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  return (
    format
      // 年
      .replace('YYYY', year.toString())
      // 月
      .replace('MM', zeroPadding(month, 2))
      .replace('M', month.toString())
      // 日
      .replace('DD', zeroPadding(days, 2))
      .replace('D', days.toString())
      // 時
      .replace('hh', zeroPadding(hours, 2))
      .replace('h', hours.toString())
      // 分
      .replace('mm', zeroPadding(minutes, 2))
      .replace('m', minutes.toString())
      // 秒
      .replace('ss', zeroPadding(seconds, 2))
      .replace('s', seconds.toString())
  )
}

export const formatedToSeconds = (formated: string) => {
  const parts = formated.split(':').map(Number).reverse()

  let seconds = 0

  seconds += parts[0] ?? 0
  seconds += (parts[1] ?? 0) * 60
  seconds += (parts[2] ?? 0) * 3600

  return seconds
}
