export const isVisible = <T extends Element>(elm: T | null): elm is T => {
  return elm instanceof HTMLElement && elm.offsetParent !== null
}
