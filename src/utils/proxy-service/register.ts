import type { ExtensionMessenger } from '@webext-core/messaging'
import type { WindowMessenger } from '@webext-core/messaging/page'
import type { Service, ProtocolMap } from '.'

import get from '@/utils/get-value'

export const registerProxy = <TService extends Service>(
  name: string,
  service: TService,
  onMessage: (
    | ExtensionMessenger<ProtocolMap>
    | WindowMessenger<ProtocolMap>
  )['onMessage']
) => {
  const messageKey = `proxy-service:${name}`

  return onMessage(messageKey, ({ data }) => {
    const target = get(service, data.path)

    if (target) {
      const method = target instanceof Function ? target.bind(service) : target

      return Promise.resolve(method(...data.args))
    }
  })
}
