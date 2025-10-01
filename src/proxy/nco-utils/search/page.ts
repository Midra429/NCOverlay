import type { ncoSearch } from '@midra/nco-utils/search'

import { createProxy } from '@/utils/proxy-service/create'
import { sendMessage } from '@/utils/proxy-service/messaging/page'

export const ncoSearchProxy = createProxy<typeof ncoSearch>(
  'ncoSearch',
  sendMessage
)
