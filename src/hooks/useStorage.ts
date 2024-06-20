import type { StorageItems, StorageKey } from '@/types/storage'
import type { StorageOnChangeCallback } from '@/utils/storage'

import { useState, useEffect } from 'react'
import { storage } from '@/utils/storage/extension'

export function useStorage<Key extends StorageKey>(
  key: Key,
  initialValue: StorageItems[Key]
): {
  loading: boolean
  value: StorageItems[Key]
  setValue: (value: StorageItems[Key] | null) => void
}

export function useStorage<Key extends StorageKey>(
  key: Key
): {
  loading: boolean
  value: StorageItems[Key] | null
  setValue: (value: StorageItems[Key] | null) => void
}

export function useStorage<Key extends StorageKey>(
  key: Key,
  initialValue?: StorageItems[Key]
) {
  const [state, setState] = useState<StorageItems[Key] | null>(
    initialValue ?? null
  )
  const [loading, setLoading] = useState<boolean>(true)

  const setValue = (value: StorageItems[Key] | null) => {
    storage.set(key, value)
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

  return {
    loading,
    value: state,
    setValue,
  }
}
