import type { FilesizeOptions } from 'filesize'

import { partial } from 'filesize'

export const filesize = partial({
  round: 0,
} satisfies FilesizeOptions)
