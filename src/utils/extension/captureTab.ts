import { webext } from '@/utils/webext'

export const captureTab = async ({
  rect,
  scale,
  format,
  windowId,
}: {
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
  scale: number
  format?: 'jpeg' | 'png'
  windowId?: number
}) => {
  format ??= 'jpeg'

  const url = await webext.tabs.captureVisibleTab(windowId, {
    format,
    quality: 85,
  })

  const blob = await (await fetch(url)).blob()
  const bitmap = await createImageBitmap(blob)

  const canvas = new OffscreenCanvas(1920, 1080)
  const ctx = canvas.getContext('2d')

  ctx?.drawImage(
    bitmap,
    Math.floor(rect.x * scale),
    Math.floor(rect.y * scale),
    Math.floor(rect.width * scale),
    Math.floor(rect.height * scale),
    0,
    0,
    canvas.width,
    canvas.height
  )

  const canvasBlob = await canvas.convertToBlob({
    type: `image/${format}`,
  })
  const buffer = await canvasBlob.arrayBuffer()

  return [...new Uint8Array(buffer)]
}
