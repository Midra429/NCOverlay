import type { PluginFunction } from '@/types/constants'

import { exitFullscreen, toggleFullscreen } from '@/utils/dom/fullscreen'

/**
 * フルスクリーン (ブラウザサイズ)
 */
export function windowSizeFullscreen(): ReturnType<PluginFunction> {
  const _requestFullscreen = Element.prototype.requestFullscreen

  Element.prototype.requestFullscreen = new Proxy(_requestFullscreen, {
    apply: (target, thisArg: Element, argArray) => {
      if (thisArg.id === 'bchplayer-box') {
        thisArg.classList.toggle('bch-fullscreen')
        toggleFullscreen(thisArg)
      } else {
        return Reflect.apply(target, thisArg, argArray)
      }
    },
  })

  return () => {
    exitFullscreen()

    Element.prototype.requestFullscreen = _requestFullscreen
  }
}
