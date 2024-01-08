const HEX_COLOR_REGEXP = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

export const hexToRGB = (
  hex: string
): [r: number, g: number, b: number] | null => {
  const result = HEX_COLOR_REGEXP.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null
}
