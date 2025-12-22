import type { NCOStateItem, NCOStateItemKey } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'

import { SLOTS_REFRESH_SETTINGS_KEYS } from '@/constants/settings'
import { settings } from '@/utils/settings/extension'
import { sendMessageToContent } from '@/messaging/to-content'
import { NCOState } from '@/ncoverlay/state'

export let ncoId: number | undefined
export let ncoState: NCOState | undefined

export async function initializeNcoState() {
  const id = await sendMessageToContent('getNcoId', null)

  if (id) {
    ncoId = id
    ncoState = new NCOState(id)
  }
}

export function useNcoState<K extends NCOStateItemKey>(
  key: K
): NCOStateItem<K> | null {
  const [state, setState] = useState<NCOStateItem<K> | null>(null)

  useEffect(() => {
    if (!ncoState) return

    ncoState.get(key).then(setState)

    const removeListenerCallbacks: (() => void)[] = []

    if (key === 'slots') {
      async function ngChangedCallback() {
        setState(await ncoState!.get(key))
      }

      for (const key of SLOTS_REFRESH_SETTINGS_KEYS) {
        removeListenerCallbacks.push(settings.onChange(key, ngChangedCallback))
      }
    }

    const onChangeRemoveListener = ncoState.onChange(key, setState)

    return () => {
      onChangeRemoveListener()

      while (removeListenerCallbacks.length) {
        removeListenerCallbacks.pop()?.()
      }
    }
  }, [])

  return state
}
