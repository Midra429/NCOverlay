export const zeroPadding = (target: string | number, length: number) => {
  return target.toString().padStart(length, '0')
}
