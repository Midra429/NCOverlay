import { useState, useEffect } from 'react'

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

export const useSystemTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    mediaQuery.matches ? 'dark' : 'light'
  )

  useEffect(() => {
    const onChange = (evt: MediaQueryListEvent) => {
      setTheme(evt.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [])

  return theme
}
