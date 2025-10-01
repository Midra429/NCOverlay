import merge from 'deepmerge'

export function deepmerge<T1, T2>(x: T1, y: T2): T1 & T2 {
  return merge(x as any, y as any, {
    customMerge: (_, options) => {
      return (x, y) => {
        if (typeof y === 'undefined') {
          return x
        }

        return merge(x, y, options)
      }
    },
  })
}
