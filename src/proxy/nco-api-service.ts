import { defineProxyService } from '@webext-core/proxy-service'
import { ncoApi } from '@midra/nco-api'

export const [registerNcoApiProxy, getNcoApiProxy] = defineProxyService(
  'ncoApiProxy',
  () => ncoApi
)
