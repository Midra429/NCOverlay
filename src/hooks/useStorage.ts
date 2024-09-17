import type { StorageItems, StorageKey } from '@/types/storage'
import type { StorageOnChangeCallback } from '@/utils/storage'

import { useEffect, useState } from 'react'

import { storage } from '@/utils/storage/extension'

export function useStorage<Key extends StorageKey>(
  key: Key,
  initialValue: StorageItems[Key]
): [
  StorageItems[Key],
  React.Dispatch<React.SetStateAction<StorageItems[Key] | null>>,
  { loading: boolean },
]

export function useStorage<Key extends StorageKey>(
  key: Key
): [
  StorageItems[Key] | null,
  React.Dispatch<React.SetStateAction<StorageItems[Key] | null>>,
  { loading: boolean },
]

export function useStorage<Key extends StorageKey>(
  key: Key,
  initialValue?: StorageItems[Key]
) {
  const [state, setState] = useState<StorageItems[Key] | null>(
    initialValue ?? null
  )
  const [loading, setLoading] = useState<boolean>(true)

  const setValue: React.Dispatch<
    React.SetStateAction<StorageItems[Key] | null>
  > = (value) => {
    if (typeof value === 'function') {
      storage.set(key, value(state))
    } else {
      storage.set(key, value)
    }
  }

  useEffect(() => {
    storage.get(key).then((value) => {
      setState(value ?? initialValue ?? null)
      setLoading(false)
    })

    const callback: StorageOnChangeCallback<Key> = (value) => {
      setState(value ?? initialValue ?? null)
    }

    return storage.onChange(key, callback)
  }, [])

  return [state, setValue, { loading }]
}
