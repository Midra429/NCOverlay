const fullWidthTohalfWidth = (str: string) => {
  return str
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace('：', ':')
}

export const formatedToSeconds = (formated?: string): number => {
  if (formated) {
    const splited = fullWidthTohalfWidth(formated)
      .split(':')
      .map((v) => Number(v.trim()))

    if (splited.every(Number.isFinite)) {
      const [sec, min, hour] = [
        ...splited.reverse(),
        ...Array<number>(3 - splited.length).fill(0),
      ]

      return sec + min * 60 + hour * 3600
    }
  }

  return 0
}
