import type { PluginFunction } from '@/types/constants'

import { exitFullscreen, toggleFullscreen } from '@/utils/dom/fullscreen'

/**
 * フルスクリーン (ブラウザサイズ)
 */
export const windowSizeFullscreen: PluginFunction = () => {
  const _requestFullscreen = Element.prototype.requestFullscreen

  Element.prototype.requestFullscreen = new Proxy(_requestFullscreen, {
    apply: async (target, thisArg: Element, argArray) => {
      if (thisArg.classList.contains('c-vod-EpisodePlayerContainer-wrapper')) {
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
