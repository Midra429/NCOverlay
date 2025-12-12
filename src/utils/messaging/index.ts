import type {
  ExtensionMessage,
  GetReturnType,
  MaybePromise,
  Message,
} from '@webext-core/messaging'

export interface ReceivedCallback<
  ProtocolMap extends Record<string, any>,
  T extends keyof ProtocolMap,
> {
  (
    message: Message<ProtocolMap, T> & ExtensionMessage
  ): MaybePromise<GetReturnType<ProtocolMap[T]>>
}
