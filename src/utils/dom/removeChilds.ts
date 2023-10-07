export const removeChilds = (elm: HTMLElement) => {
  while (elm.firstChild) {
    elm.removeChild(elm.firstChild)
  }
}
