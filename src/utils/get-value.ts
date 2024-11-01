export default (target: any, paths?: string | string[]) => {
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
