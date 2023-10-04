export const zeroPadding = (num: number, len: number): string => {
  return (Array(len).fill(0).join('') + num).slice(len * -1)
}
