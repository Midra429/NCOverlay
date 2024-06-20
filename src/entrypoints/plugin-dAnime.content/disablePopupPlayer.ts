/**
 * ポップアッププレイヤー無効化
 */
export const disablePopupPlayer = () => {
  window.open = new Proxy(window.open, {
    apply: (target, _, argArray: Parameters<Window['open']>) => {
      if (
        argArray[0]?.toString().startsWith('/animestore/sc_pc') &&
        argArray[1] === 'popupwindow'
      ) {
        return target(argArray[0])
      } else {
        return target(...argArray)
      }
    },
  })
}
