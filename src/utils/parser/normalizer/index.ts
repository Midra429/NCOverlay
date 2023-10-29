import { space } from './space'
import { symbol } from './symbol'
import { romanNum } from './romanNum'
import { text } from './text'

export const normalizer = {
  space,
  symbol,
  romanNum,
  text,

  all: (str: string) => text(str, { all: true }),
}
