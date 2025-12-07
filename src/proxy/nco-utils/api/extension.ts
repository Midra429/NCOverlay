import type { ncoApi } from '@midra/nco-utils/api'

import { createProxy } from '@/utils/proxy-service/create'
import { sendProxyMessage } from '@/utils/proxy-service/messaging/extension'

export const ncoApiProxy = createProxy<typeof ncoApi>(
  'ncoApi',
  sendProxyMessage
)
