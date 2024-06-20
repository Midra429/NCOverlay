export const zeroPadding = (target: string | number, len: number) => {
  return (Array(len).fill(0).join('') + target).slice(len * -1)
}
