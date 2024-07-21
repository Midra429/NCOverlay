import type { NCOStateEventMap, NCOStateJson, Slot } from '@/ncoverlay/state'

import { useState, useEffect } from 'react'

import { webext } from '@/utils/webext'

import { ncoMessenger } from '@/ncoverlay/messaging'
import { NCOState } from '@/ncoverlay/state'

export let ncoState: NCOState | null = null

export const initializeNcoState = async () => {
  try {
    const tab = await webext.getCurrentActiveTab()
    const id = await ncoMessenger.sendMessage('getId', null, tab?.id)

    if (id) {
      ncoState = new NCOState(id)
    }
  } catch {}
}

export const useNcoStateJson = <
  Keys extends (keyof Omit<NCOStateJson, '_id'>)[],
  Result = Keys['length'] extends 0
    ? NCOStateJson
    : { [key in Keys[number]]: NCOStateJson[key] },
>(
  ...keys: Keys
): Result | null => {
  const [state, setState] = useState<Result | null>(null)

  useEffect(() => {
    setState(ncoState?.getJSON(...keys) ?? null)

    const callback: NCOStateEventMap['change'] = function (key) {
      if (!keys || keys.includes(key)) {
        setState(this.getJSON(...keys) ?? null)
      }
    }

    ncoState?.addEventListener('change', callback)

    return () => {
      ncoState?.removeEventListener('change', callback)
    }
  }, [])

  return state
}

export const useNcoStateSlot = (id: string) => {
  const [state, setState] = useState<Slot | null>(null)

  useEffect(() => {
    setState(ncoState?.slots.get(id) ?? null)

    const callback: NCOStateEventMap['change'] = function (key) {
      if (key === 'slots') {
        setState(this.slots.get(id) ?? null)
      }
    }

    ncoState?.addEventListener('change', callback)

    return () => {
      ncoState?.removeEventListener('change', callback)
    }
  }, [])

  return state
}
