import type { Config } from 'tailwindcss'
import type { CustomThemeConfig } from 'tailwindcss/types/config'

import { nextui } from '@nextui-org/react'

import { themeColorsLight, themeColorsDark, brandColors } from './theme-colors'

const fontSize: CustomThemeConfig['fontSize'] = {
  mini: ['0.6875rem', '0.875rem'],
}

const size: CustomThemeConfig['width' | 'height'] = {
  mini: fontSize.mini[0],
  tiny: '0.75rem',
  small: '0.875rem',
  medium: '1rem',
  large: '1.125rem',
}

export default {
  content: [
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...brandColors,
      },
      fontSize,
      width: size,
      height: size,
      size: size,
    },
  },
  plugins: [
    nextui({
      themes: {
        light: {
          colors: themeColorsLight,
        },
        dark: {
          colors: themeColorsDark,
        },
      },
    }),
  ],
} satisfies Config
