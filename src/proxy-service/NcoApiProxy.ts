import { ncoApi } from '@midra/nco-api'

import { defineProxyService } from '@webext-core/proxy-service'

export const [registerNcoApiProxy, getNcoApiProxy] = defineProxyService(
  'NcoApiProxy',
  () => ncoApi
)
