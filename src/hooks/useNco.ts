import type { NCOStateItemKey, NCOStateItem } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'

import { getNcoId } from '@/utils/extension/getNcoId'
import { settings } from '@/utils/settings/extension'
import { NCOState } from '@/ncoverlay/state'
import { ncoMessenger } from '@/ncoverlay/messaging'

export let ncoId: string | undefined
export let ncoState: NCOState | undefined

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
  const id = await getNcoId(tabId)

  if (id) {
    ncoId = id
    ncoState = new NCOState(id)
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

export const useNcoState = <Key extends NCOStateItemKey>(
  key: Key
): NCOStateItem<Key> | null => {
  const [state, setState] = useState<NCOStateItem<Key> | null>(null)

  useEffect(() => {
    if (!ncoState) return

    ncoState.get(key).then((value) => {
      setState(value)
    })

    let ngOnChangeRemoveListeners: (() => void)[] | undefined

    if (key === 'slots') {
      const ngChangedCallback = async () => {
        setState(await ncoState!.get(key))
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

    const onChangeRemoveListener = ncoState.onChange(key, (value) => {
      setState(value)
    })

    return () => {
      onChangeRemoveListener()

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