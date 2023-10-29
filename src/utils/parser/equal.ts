import { normalizer } from './normalizer'

export const equal = (
  a?: number | string | null,
  b?: number | string | null
) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b
  }

  if (typeof a === 'string' && typeof b === 'string') {
    return normalizer.all(a) === normalizer.all(b)
  }

  return false
}
