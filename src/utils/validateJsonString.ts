export function validateJsonString(
  text: string,
  options?: {
    object?: boolean
    array?: boolean
  }
): boolean {
  try {
    const json = JSON.parse(text)

    if (options?.object) {
      return json instanceof Object && !Array.isArray(json)
    } else if (options?.array) {
      return Array.isArray(json)
    }

    return true
  } catch {
    return false
  }
}
