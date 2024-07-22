export const getObjectFitRect = (
  contains: boolean,
  container: HTMLElement,
  width: number,
  height: number
) => {
  const {
    x: cx,
    y: cy,
    width: cWidth,
    height: cHeight,
  } = container.getBoundingClientRect()

  const cRatio = cWidth / cHeight
  const ratio = width / height

  let targetWidth = 0
  let targetHeight = 0

  // 上下に余白あり
  if (contains ? cRatio < ratio : ratio < cRatio) {
    targetWidth = cWidth
    targetHeight = targetWidth / ratio
  }
  // 左右に余白あり
  else {
    targetHeight = cHeight
    targetWidth = targetHeight * ratio
  }

  return {
    x: cx + (cWidth - targetWidth) / 2,
    y: cy + (cHeight - targetHeight) / 2,
    width: targetWidth,
    height: targetHeight,
  }
}
