export function getCookie(): Record<string, string>

export function getCookie(key: string): string | null

export function getCookie(
  key?: string
): Record<string, string> | string | null {
  const cookie: Record<string, string> = Object.fromEntries(
    document.cookie.split(';').map((v) => v.trim().split('='))
  )

  if (typeof key === 'string') {
    return cookie[key] ?? null
  } else {
    return cookie
  }
}
