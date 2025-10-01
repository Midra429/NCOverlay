export default function <T extends unknown>(
  target: any,
  paths?: string | string[]
): T | undefined {
  if (paths) {
    if (typeof paths === 'string') {
      paths = paths.split('.')
    }

    for (const p of paths) {
      try {
        target = target[p]
      } catch {
        break
      }
    }
  }

  return target
}
