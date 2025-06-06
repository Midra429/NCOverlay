export const isVideoId = (value: string) => {
  return /^[a-z]{2}\d+$/.test(value)
}

export const extractVideoId = (value: string): string | null => {
  if (isVideoId(value)) {
    return value
  }

  try {
    const { hostname, pathname } = new URL(value)

    // https://www.nicovideo.jp/watch/so30406298
    // https://sp.nicovideo.jp/watch/so32994420
    if (
      /^((www|sp)\.)?nicovideo\.jp$/.test(hostname) &&
      /^\/watch\/[a-z]{2}\d+$/.test(pathname)
    ) {
      return pathname.split('/').at(-1)!
    }
    // https://nico.ms/so34006022
    else if (
      /^\.?nico\.ms$/.test(hostname) &&
      /^\/[a-z]{2}\d+$/.test(pathname)
    ) {
      return pathname.split('/').at(-1)!
    }
  } catch {}

  return null
}
