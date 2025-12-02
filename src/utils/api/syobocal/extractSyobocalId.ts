const SC_ID_REGEXP = /^\d+$/
const PATH_REGEXP = /^\/tid\/\d+(\/|$)/

export function isSyobocalId(value: string) {
  return SC_ID_REGEXP.test(value)
}

export function extractSyobocalId(value: string): string | null {
  if (isSyobocalId(value)) {
    return value
  }

  try {
    const { hostname, pathname } = new URL(value)

    if (hostname === 'cal.syoboi.jp' && PATH_REGEXP.test(pathname)) {
      return pathname.split('/')[2]
    }
  } catch {}

  return null
}
