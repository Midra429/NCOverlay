import { useEffect, useState } from 'react'

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function useSystemTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    mediaQuery.matches ? 'dark' : 'light'
  )

  useEffect(() => {
    function onChange(evt: MediaQueryListEvent) {
      setTheme(evt.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [])

  return theme
}
