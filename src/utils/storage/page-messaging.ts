import type {
  StorageGetFunction,
  StorageSetFunction,
  StorageRemoveFunction,
} from '.'

import { defineCustomEventMessaging } from '@webext-core/messaging/page'

// content (world: MAIN) -> content

type ProtocolMap = {
  get: (
    args: Parameters<StorageGetFunction>
  ) => Awaited<ReturnType<StorageGetFunction>>

  set: (
    args: Parameters<StorageSetFunction>
  ) => Awaited<ReturnType<StorageSetFunction>>

  remove: (
    args: Parameters<StorageRemoveFunction>
  ) => Awaited<ReturnType<StorageRemoveFunction>>
}

export const storagePageMessenger = defineCustomEventMessaging<ProtocolMap>({
  namespace: `${EXT_BUILD_ID}:storage/page-messaging`,
})
