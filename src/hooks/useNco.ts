import type { NCOStateItem, NCOStateItemKey } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'

import { SLOTS_REFRESH_SETTINGS_KEYS } from '@/constants/settings'
import { webext } from '@/utils/webext'
import { settings } from '@/utils/settings/extension'
import { NCOState } from '@/ncoverlay/state'

export let ncoId: number | undefined
export let ncoState: NCOState | undefined

export async function initializeNcoState() {
  const tabId = await webext.getCurrentActiveTabId()

  if (tabId != null) {
    ncoId = tabId
    ncoState = new NCOState(ncoId)
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
