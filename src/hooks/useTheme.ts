import { useSettings } from './useSettings'
import { useSystemTheme } from './useSystemTheme'

export function useTheme() {
  const [theme, _, { loading }] = useSettings('theme')
  const systemTheme = useSystemTheme()

  if (loading) {
    return null
  }

  if (theme !== 'auto') {
    return theme
  }

  return systemTheme
}
