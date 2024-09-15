import type { Config } from 'tailwindcss'

import { nextui } from '@nextui-org/react'

import { themeColorsLight, themeColorsDark, brandColors } from './theme-colors'

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
      fontSize: {
        min: ['0.6875rem', '0.875rem'],
      },
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
