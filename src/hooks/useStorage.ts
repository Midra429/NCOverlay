import type { StorageItems, StorageKey } from '@/types/storage'
import type { StorageOnChangeCallback } from '@/utils/storage'

import { useEffect, useState } from 'react'

import { storage } from '@/utils/storage/extension'

export function useStorage<K extends StorageKey>(
  key: K,
  initialValue: StorageItems[K]
): [
  StorageItems[K],
  React.Dispatch<React.SetStateAction<StorageItems[K] | null>>,
  { loading: boolean },
]

export function useStorage<K extends StorageKey>(
  key: K
): [
  StorageItems[K] | null,
  React.Dispatch<React.SetStateAction<StorageItems[K] | null>>,
  { loading: boolean },
]

export function useStorage<K extends StorageKey>(
  key: K,
  initialValue?: StorageItems[K]
) {
  const [state, setState] = useState<StorageItems[K] | null>(
    initialValue ?? null
  )
  const [loading, setLoading] = useState<boolean>(true)

  const setValue: React.Dispatch<
    React.SetStateAction<StorageItems[K] | null>
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

    const callback: StorageOnChangeCallback<K> = (value) => {
      setState(value ?? initialValue ?? null)
    }

    return storage.onChange(key, callback)
  }, [])

  return [state, setValue, { loading }]
}
