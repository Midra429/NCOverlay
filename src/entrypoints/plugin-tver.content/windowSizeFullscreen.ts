import type { PluginFunction } from '@/types/constants'

/**
 * フルスクリーン (ブラウザサイズ)
 */
export const windowSizeFullscreen: PluginFunction = () => {
  const _requestFullscreen = Element.prototype.requestFullscreen

  Element.prototype.requestFullscreen = new Proxy(_requestFullscreen, {
    apply: (target, thisArg: Element, argArray) => {
      if (thisArg.hasAttribute('js-fullscreen-target')) {
        document.documentElement.classList.toggle(
          'NCOverlay-Plugin-windowSizeFullscreen'
        )
      } else {
        return Reflect.apply(target, thisArg, argArray)
      }
    },
  })

  return () => {
    document.documentElement.classList.remove(
      'NCOverlay-Plugin-windowSizeFullscreen'
    )

    Element.prototype.requestFullscreen = _requestFullscreen
  }
}
