export const filterObject = (obj: object) => {
  if (
    obj !== null &&
    obj !== void 0 &&
    typeof obj === 'object' &&
    !Array.isArray(obj)
  ) {
    for (const key of Object.keys(obj)) {
      if (obj[key] === null || obj[key] === void 0) {
        delete obj[key]
      } else {
        filterObject(obj[key])
      }
    }
  }
}
