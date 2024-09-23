import type { PluginFunction } from '@/types/constants'

/**
 * フルスクリーン (ブラウザサイズ)
 */
export const windowSizeFullscreen: PluginFunction = () => {
  const _requestFullscreen = Element.prototype.requestFullscreen
  const _exitFullscreen = Document.prototype.exitFullscreen

  Element.prototype.requestFullscreen = new Proxy(_requestFullscreen, {
    apply: async (_, thisArg) => {
      Object.defineProperty(document, 'fullscreenElement', {
        get: () => thisArg,
        configurable: true,
      })

      document.dispatchEvent(new Event('fullscreenchange'))
    },
  })

  Document.prototype.exitFullscreen = new Proxy(_exitFullscreen, {
    apply: async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        get: () => null,
        configurable: true,
      })

      document.dispatchEvent(new Event('fullscreenchange'))
    },
  })

  return () => {
    document.exitFullscreen()

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
    })

    // @ts-ignore
    delete document.fullscreenElement

    Element.prototype.requestFullscreen = _requestFullscreen
    Document.prototype.exitFullscreen = _exitFullscreen
  }
}
