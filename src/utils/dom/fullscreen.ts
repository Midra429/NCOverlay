export const requestFullscreen = (element: Element) => {
  if (element.hasAttribute('nco-fullscreen')) {
    return false
  }

  element.setAttribute('nco-fullscreen', '')

  return true
}

export const exitFullscreen = () => {
  const fullscreenElement = document.querySelector('[nco-fullscreen]')

  if (!fullscreenElement) {
    return false
  }

  fullscreenElement.removeAttribute('nco-fullscreen')

  return true
}

export const toggleFullscreen = (element: Element) => {
  if (!requestFullscreen(element)) {
    exitFullscreen()
  }
}
