import { webext } from '@/utils/webext'

const COLORS = {
  primary: '#3b61de',
  red: '#f31260',
  green: '#0dac52',
  blue: '#006fee',
  yellow: '#ef8511',
}

export async function setBadge({
  text,
  color,
  tabId,
}: {
  text: string | null
  color?: keyof typeof COLORS
  tabId?: number
}) {
  text ??= ''

  const bgColor = COLORS[color ?? 'primary']
  const textColor = '#ffffff'

  await Promise.allSettled([
    webext.action.setBadgeBackgroundColor({
      color: bgColor,
      tabId,
    }),

    webext.action.setBadgeTextColor({
      color: textColor,
      tabId,
    }),

    webext.action.setBadgeText({
      text,
      tabId,
    }),
  ])
}
