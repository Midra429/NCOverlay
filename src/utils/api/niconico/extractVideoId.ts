import { VIDEO_ID_REGEXP } from '@midra/nco-utils/api/constants'

const HOST_LONG_REGEXP = /^((www|sp)\.)?nicovideo\.jp$/
const PATH_LONG_REGEXP = /^\/watch\/[a-z]{2}\d+$/
const HOST_SHORT_REGEXP = /^\.?nico\.ms$/
const PATH_SHORT_REGEXP = /^\/[a-z]{2}\d+$/

export function isVideoId(value: string) {
  return VIDEO_ID_REGEXP.test(value)
}

export function extractVideoId(value: string): string | null {
  if (isVideoId(value)) {
    return value
  }

  try {
    const { hostname, pathname } = new URL(value)

    if (
      // https://www.nicovideo.jp/watch/so30406298
      // https://sp.nicovideo.jp/watch/so32994420
      (HOST_LONG_REGEXP.test(hostname) && PATH_LONG_REGEXP.test(pathname)) ||
      // https://nico.ms/so34006022
      (HOST_SHORT_REGEXP.test(hostname) && PATH_SHORT_REGEXP.test(pathname))
    ) {
      return pathname.split('/').at(-1)!
    }
  } catch {}

  return null
}
