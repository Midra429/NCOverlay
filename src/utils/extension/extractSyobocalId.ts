export function isSyobocalId(value: string) {
  return /^\d+$/.test(value)
}

export function extractSyobocalId(value: string): string | null {
  if (isSyobocalId(value)) {
    return value
  }

  try {
    const { hostname, pathname } = new URL(value)

    if (hostname === 'cal.syoboi.jp' && /^\/tid\/\d+(\/|$)/.test(pathname)) {
      return pathname.split('/')[2]
    }
  } catch {}

  return null
}
