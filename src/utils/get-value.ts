export default (target: any, path?: string) => {
  if (path) {
    for (const name of path.split('.')) {
      try {
        target = target[name]
      } catch {
        break
      }
    }
  }

  return target
}
