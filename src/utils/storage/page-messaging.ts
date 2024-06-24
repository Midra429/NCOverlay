import type {
  StorageGetFunction,
  StorageSetFunction,
  StorageRemoveFunction,
  StorageGetBytesInUseFunction,
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

  getBytesInUse: (
    args: Parameters<StorageGetBytesInUseFunction>
  ) => Awaited<ReturnType<StorageGetBytesInUseFunction>>
}

export const storagePageMessenger = defineCustomEventMessaging<ProtocolMap>({
  namespace: `${EXT_BUILD_ID}:storage/page-messaging`,
})
