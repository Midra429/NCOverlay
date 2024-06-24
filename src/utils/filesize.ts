import type { FileSizeOptions } from 'filesize'

import { partial } from 'filesize'

export const filesize = partial({
  round: 0,
  spacer: '',
} satisfies FileSizeOptions)
