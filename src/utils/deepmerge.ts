import merge from 'deepmerge'

const options: merge.Options = {
  customMerge: (_, options) => {
    return (x, y) => {
      if (typeof x === 'undefined') {
        return y
      } else if (typeof y === 'undefined') {
        return x
      }

      return merge(x, y, options)
    }
  },
}

export function deepmerge<T1, T2>(x: T1, y: T2): T1 & T2 {
  return merge(x ?? {}, y ?? {}, options) as any
}
