import { zeroPadding } from './zeroPadding'

export const formatDuration = (seconds: number) => {
  const sign = seconds < 0 ? '-' : ''

  let secAbs = Math.abs(Math.floor(seconds))

  const hours = Math.floor(secAbs / 3600)
  secAbs %= 3600

  const minutes = Math.floor(secAbs / 60)
  secAbs %= 60

  let formatted = ''

  if (hours) {
    formatted += `${zeroPadding(hours, 2)}:`
  }

  formatted += `${zeroPadding(minutes, 2)}:${zeroPadding(secAbs, 2)}`

  return `${sign}${formatted}`
}

export const formatDate = (
  date: string | number | Date,
  format: string = 'YYYY/MM/DD(d) hh:mm'
) => {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const days = date.getDate()
  const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]

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
      // 曜日
      .replace('ddd', `${dow}曜日`)
      .replace('d', dow)
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
