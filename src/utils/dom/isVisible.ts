export const isVisible = (elm?: Element | null): boolean => {
  if (!(elm instanceof HTMLElement)) {
    return false
  }

  const { width, height } = elm.getBoundingClientRect()

  return elm.offsetParent !== null && 0 < width && 0 < height
}
