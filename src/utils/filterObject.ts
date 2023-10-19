export const filterObject = (obj: object) => {
  if (obj != null && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      if (obj[key] == null) {
        delete obj[key]
      } else {
        filterObject(obj[key])
      }
    }
  }
}
