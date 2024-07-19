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

export const useNcoStateJson = (targetKeys?: (keyof NCOStateJson)[]) => {
  const [state, setState] = useState<NCOStateJson | null>(null)

  useEffect(() => {
    setState(ncoState?.getJSON() ?? null)

    const callback: NCOStateEventMap['change'] = function (key) {
      if (!targetKeys || targetKeys.includes(key)) {
        setState(this.getJSON() ?? null)
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
