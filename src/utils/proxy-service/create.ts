import type { ExtensionMessenger } from '@webext-core/messaging'
import type { WindowMessenger } from '@webext-core/messaging/page'
import type { ProxyService } from '@webext-core/proxy-service'
import type { Service, ProtocolMap } from '.'

export const createProxy = <TService extends Service>(
  name: string,
  sendMessage: (
    | ExtensionMessenger<ProtocolMap>
    | WindowMessenger<ProtocolMap>
  )['sendMessage']
) => {
  const messageKey = `proxy-service:${name}`

  const create = (path?: string): ProxyService<TService> => {
    const wrapped = (() => {}) as ProxyService<TService>

    const proxy = new Proxy(wrapped, {
      get(target, property, receiver) {
        if (property === '__proxy' || typeof property === 'symbol') {
          return Reflect.get(target, property, receiver)
        }

        return create(!path ? property : `${path}.${property}`)
      },

      apply(_target, _thisArg, args) {
        return sendMessage(messageKey, { path, args }, ...([] as any))
      },
    })

    // @ts-expect-error
    proxy.__proxy = true

    return proxy
  }

  return create()
}
