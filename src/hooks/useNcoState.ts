import type { NCOStateJson, Slot } from '@/ncoverlay/state'

import { useState, useEffect } from 'react'

import { webext } from '@/utils/webext'

import { ncoMessenger } from '@/ncoverlay/messaging'
import { NCOState } from '@/ncoverlay/state'

export let ncoState: NCOState | null = null

export const initializeNcoState = async () => {
  try {
    const tab = await webext.getCurrentActiveTab()
    const id = await ncoMessenger.sendMessage('p-c:getId', null, tab?.id)

    if (id) {
      ncoState = new NCOState(id)
    }
  } catch {}
}

export const useNcoStateJson = () => {
  const [state, setState] = useState<NCOStateJson | null>(null)

  useEffect(() => {
    ncoState?.addEventListener('change', () => {
      setState(ncoState?.getJSON() ?? null)
    })
  }, [])

  return state
}

export const useNcoStateSlot = (id: string) => {
  const [state, setState] = useState<Slot | null>(null)

  useEffect(() => {
    ncoState?.addEventListener('change', () => {
      setState(ncoState?.slots.get(id) ?? null)
    })
  }, [])

  return state
}
