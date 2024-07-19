import type { StorageKey } from '@/types/storage'
import type {
  StorageGetFunction,
  StorageSetFunction,
  StorageRemoveFunction,
  StorageGetBytesInUseFunction,
  StorageOnChangeCallback,
  StorageLoadAndWatchCallback,
} from '.'

import { defineWindowMessaging } from '@webext-core/messaging/page'

// content (world: MAIN) -> content

type ProtocolMap = {
  'get': (
    args: Parameters<StorageGetFunction>
  ) => Awaited<ReturnType<StorageGetFunction>>

  'set': (
    args: Parameters<StorageSetFunction>
  ) => Awaited<ReturnType<StorageSetFunction>>

  'remove': (
    args: Parameters<StorageRemoveFunction>
  ) => Awaited<ReturnType<StorageRemoveFunction>>

  'getBytesInUse': (
    args: Parameters<StorageGetBytesInUseFunction>
  ) => Awaited<ReturnType<StorageGetBytesInUseFunction>>

  'onChange:register': (key: StorageKey) => string
  'onChange:unregister': (id: string) => void
  'onChange:changed': (
    args: [id: string, ...Parameters<StorageOnChangeCallback<StorageKey>>]
  ) => void

  'loadAndWatch:register': (key: StorageKey) => string
  'loadAndWatch:unregister': (id: string) => void
  'loadAndWatch:changed': (
    args: [id: string, ...Parameters<StorageLoadAndWatchCallback<StorageKey>>]
  ) => void
}

export const storagePageMessenger = defineWindowMessaging<ProtocolMap>({
  namespace: `${EXT_BUILD_ID}:storage/page-messaging`,
})
