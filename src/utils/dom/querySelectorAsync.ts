export async function querySelectorAsync<T extends Element>(
  parent: HTMLElement,
  selectors: string,
  options?: {
    intervalMs: number
    timeoutMs: number
  }
): Promise<T | null> {
  const { intervalMs = 100, timeoutMs = 5000 } = options ?? {}

  return new Promise((resolve) => {
    const start = performance.now()

    const intervalId = setInterval(() => {
      const element = parent.querySelector<T>(selectors)

      if (element) {
        resolve(element)
        clearInterval(intervalId)
      } else if (timeoutMs < performance.now() - start) {
        resolve(null)
        clearInterval(intervalId)
      }
    }, intervalMs)
  })
}
