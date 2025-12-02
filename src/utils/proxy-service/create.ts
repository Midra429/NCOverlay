import type { ExtensionMessenger } from '@webext-core/messaging'
import type { WindowMessenger } from '@webext-core/messaging/page'
import type { Service, ProtocolMap } from '.'

type PromisifyFunction<T> = T extends (...args: infer P) => infer R
  ? R extends Promise<any>
    ? T
    : (...args: P) => Promise<R>
  : never
type DeepAsync<TService> = TService extends (...args: any[]) => any
  ? PromisifyFunction<TService>
  : TService extends Record<string, any>
    ? {
        [K in keyof TService]: DeepAsync<TService[K]>
      }
    : never
type ProxyService<TService> =
  TService extends DeepAsync<TService> ? TService : DeepAsync<TService>

export function createProxy<S extends Service>(
  name: string,
  sendMessage: (
    | ExtensionMessenger<ProtocolMap>
    | WindowMessenger<ProtocolMap>
  )['sendMessage']
) {
  const messageKey = `proxy-service:${name}`

  const create = (paths: string[] = []): ProxyService<S> => {
    const wrapped = (() => {}) as ProxyService<S>

    const proxy = new Proxy(wrapped, {
      get(target, p, receiver) {
        if (p === '__proxy' || typeof p === 'symbol') {
          return Reflect.get(target, p, receiver)
        }

        return create([...paths, p])
      },

      apply(_target, _thisArg, args) {
        // @ts-ignore
        return sendMessage(messageKey, { paths, args }, ...([] as any))
      },
    })

    // @ts-expect-error
    proxy.__proxy = true

    return proxy
  }

  return create()
}
