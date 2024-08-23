const HEX_COLOR_REGEXP = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

export const hexToRgb = (hex: string): [r: number, g: number, b: number] => {
  const result = HEX_COLOR_REGEXP.exec(hex)

  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [255, 255, 255]
}

export const getBrightness = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex)

  return r * 0.299 + g * 0.587 + b * 0.114
}

export const readableColor = (color: string): string => {
  return 140 <= getBrightness(color) ? 'black' : 'white'
}
