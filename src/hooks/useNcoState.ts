import type { NCOStateEventMap, NCOStateJson } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'

import { getNcoId } from '@/utils/extension/getNcoId'
import { settings } from '@/utils/settings/extension'
import { NCOState } from '@/ncoverlay/state'
import { ncoMessenger } from '@/ncoverlay/messaging'

export let ncoId: string | null = null
export let ncoState: NCOState | null = null

const timeupdateEvent = {
  _listeners: [] as Array<(time: number) => void>,
  addEventListener(callback: (time: number) => void) {
    this._listeners.push(callback)
  },
  removeEventListener(callback: (time: number) => void) {
    this._listeners = this._listeners.filter((cb) => cb !== callback)
  },
}

ncoMessenger.onMessage('timeupdate', ({ data }) => {
  if (data.id !== ncoId) return

  timeupdateEvent._listeners.forEach((listener) => {
    listener(data.time)
  })
})

export const initializeNcoState = async (tabId?: number) => {
  ncoId = await getNcoId(tabId)

  if (ncoId) {
    ncoState = new NCOState(ncoId)
  }
}

export const useNcoStateReady = (tabId?: number) => {
  const [state, setState] = useState(false)

  useEffect(() => {
    if (ncoState) {
      setState(true)
    } else {
      initializeNcoState(tabId).then(() => {
        setState(!!ncoState)
      })
    }
  }, [])

  return state
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
    if (!ncoState) return

    setState(ncoState.getJSON(...keys) ?? null)

    const callback: NCOStateEventMap['change'] = function (key) {
      if (!keys.length || keys.includes(key)) {
        setState(this.getJSON(...keys) ?? null)
      }
    }

    ncoState.addEventListener('change', callback)

    let ngOnChangeRemoveListeners: (() => void)[] | undefined

    if (keys.includes('slots')) {
      const ngChangedCallback = () => {
        callback.call(ncoState!, 'slots')
      }

      ngOnChangeRemoveListeners = [
        settings.onChange('settings:ng:largeComments', ngChangedCallback),
        settings.onChange('settings:ng:fixedComments', ngChangedCallback),
        settings.onChange('settings:ng:coloredComments', ngChangedCallback),
        settings.onChange('settings:ng:words', ngChangedCallback),
        settings.onChange('settings:ng:commands', ngChangedCallback),
        settings.onChange('settings:ng:ids', ngChangedCallback),
      ]
    }

    return () => {
      ncoState!.removeEventListener('change', callback)

      while (ngOnChangeRemoveListeners?.length) {
        ngOnChangeRemoveListeners.pop()?.()
      }
    }
  }, [])

  return state
}

export const useNcoTime = (): number => {
  const [time, setTime] = useState<number>(0)

  useEffect(() => {
    if (!ncoId) return

    const callback = (time: number) => {
      setTime(time * 1000)
    }

    timeupdateEvent.addEventListener(callback)

    return () => {
      timeupdateEvent.removeEventListener(callback)
    }
  }, [])

  return time
}
