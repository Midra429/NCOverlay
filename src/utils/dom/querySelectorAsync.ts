export const querySelectorAsync = async <T extends HTMLElement>(
  parent: T,
  selectors: string,
  intervalMs: number = 1000
): Promise<T | null> => {
  let cnt = 0

  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      const element = parent.querySelector<T>(selectors)

      if (element) {
        resolve(element)
        clearInterval(intervalId)
      } else if (5 < ++cnt) {
        resolve(null)
        clearInterval(intervalId)
      }
    }, intervalMs)
  })
}
