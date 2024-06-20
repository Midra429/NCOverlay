import type {
  SemanticBaseColors,
  ThemeColors,
  ColorScale,
} from '@nextui-org/react'

import { semanticColors } from '@nextui-org/theme/colors'
import { readableColor } from 'color2k'

/**
 * これを短くした ↓
 * @see https://github.com/nextui-org/nextui/blob/canary/packages/core/theme/src/utils/object.ts#L3
 */
const swapColorValues = <T extends Object>(colors: T): T => {
  const keys = Object.keys(colors)
  const values = Object.values(colors)

  return Object.fromEntries(
    values.reverse().map((val, idx) => [keys[idx], val])
  ) as T
}

const primary = {
  50: '#f0f5fe',
  100: '#dee8fb',
  200: '#c4d8f9',
  300: '#9bbef5',
  400: '#6b9bef',
  500: '#4978e8',
  600: '#3b61de', // P
  700: '#2b47ca',
  800: '#283ca5',
  900: '#263782',
}

const gray = {
  light: {
    50: '#f7f8f8',
    100: '#eeeef0',
    200: '#d8dadf',
    300: '#b6b9c3',
    400: '#8f94a1',
    500: '#717786',
    600: '#5b606e',
    700: '#4a4d5a',
    800: '#40434c',
    900: '#3b3d45',
  },
  dark: {
    50: '#eeeef0',
    100: '#d8dadf',
    200: '#b6b9c3',
    300: '#8f94a1',
    400: '#717786',
    500: '#5b606e',
    600: '#4a4d5a',
    700: '#40434c',
    800: '#3b3d45',
    900: '#25262c',
  },
}

/** dアニメストア */
const danime = {
  50: '#fef4ee',
  100: '#fce7d8',
  200: '#f9caaf',
  300: '#f4a57d',
  400: '#ef7548',
  500: '#eb5528', // P
  600: '#dc391a',
  700: '#b72917',
  800: '#91231b',
  900: '#752019',
}

/** ニコニコ実況 過去ログ API */
const jikkyo = {
  50: '#effefa',
  100: '#c7fff0',
  200: '#90ffe2',
  300: '#51f7d2',
  400: '#1de4be',
  500: '#04c8a5',
  600: '#00aa90', // P
  700: '#05806e',
  800: '#0a6559',
  900: '#0d544a',
}

const base: SemanticBaseColors = {
  light: {
    ...semanticColors.light,
    background: {
      DEFAULT: '#f7f8f8',
    },
    foreground: {
      ...gray.light,
      DEFAULT: gray.light[900],
    },
    focus: {
      DEFAULT: primary[600],
    },
    content2: {
      DEFAULT: gray.light[100],
      foreground: gray.light[800],
    },
    content3: {
      DEFAULT: gray.light[200],
      foreground: gray.light[700],
    },
    content4: {
      DEFAULT: gray.light[300],
      foreground: gray.light[600],
    },
  },
  dark: {
    ...semanticColors.dark,
    background: {
      DEFAULT: '#17171c',
    },
    foreground: {
      ...swapColorValues(gray.dark),
      DEFAULT: gray.dark[100],
    },
    focus: {
      DEFAULT: primary[400],
    },
    content1: {
      DEFAULT: gray.dark[900],
      foreground: gray.dark[50],
    },
    content2: {
      DEFAULT: gray.dark[800],
      foreground: gray.dark[100],
    },
    content3: {
      DEFAULT: gray.dark[700],
      foreground: gray.dark[200],
    },
    content4: {
      DEFAULT: gray.dark[600],
      foreground: gray.dark[300],
    },
  },
}

export const themeColorsLight: Partial<ThemeColors> = {
  ...base.light,
  default: {
    ...gray.light,
    foreground: readableColor(gray.light[300]),
    DEFAULT: gray.light[300],
  },
  primary: {
    ...primary,
    foreground: readableColor(primary[600]),
    DEFAULT: primary[600],
  },
}

export const themeColorsDark: Partial<ThemeColors> = {
  ...base.dark,
  default: {
    ...swapColorValues(gray.dark),
    foreground: readableColor(gray.dark[600]),
    DEFAULT: gray.dark[600],
  },
  primary: {
    ...swapColorValues(primary),
    foreground: readableColor(primary[400]),
    DEFAULT: primary[400],
  },
}

export const brandColors = {
  danime: {
    ...danime,
    foreground: readableColor(danime[500]),
    DEFAULT: danime[500],
  } satisfies ColorScale,

  jikkyo: {
    ...jikkyo,
    foreground: readableColor(jikkyo[600]),
    DEFAULT: jikkyo[600],
  } satisfies ColorScale,
}
