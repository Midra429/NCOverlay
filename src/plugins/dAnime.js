// @ts-check
/**
 * ポップアップの再生画面を無効化
 */
const disablePopupPlayer = () => {
  console.log('[NCOverlay] Plugin: disablePopupPlayer()')

  const _open = window.open

  window.open = (url, target, features) => {
    if (
      url?.toString().startsWith('/animestore/sc_pc') &&
      target === 'popupwindow' &&
      features
    ) {
      return _open(url)
    } else {
      return _open(url, target, features)
    }
  }
}

disablePopupPlayer()
