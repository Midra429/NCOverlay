import type { PluginFunction } from '@/types/constants'

/**
 * ポップアップ無効化
 */
export const disablePopupPlayer: PluginFunction = () => {
  const _open = window.open

  window.open = new Proxy(_open, {
    apply: (target, thisArg, argArray: Parameters<Window['open']>) => {
      if (
        argArray[0]?.toString().startsWith('/animestore/sc_pc') &&
        argArray[1] === 'popupwindow'
      ) {
        return Reflect.apply(target, thisArg, [argArray[0]])
      } else {
        return Reflect.apply(target, thisArg, argArray)
      }
    },
  })

  return () => {
    window.open = _open
  }
}
