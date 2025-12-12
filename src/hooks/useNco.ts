import type { NCOStateItem, NCOStateItemKey } from '@/ncoverlay/state'

import { useEffect, useState } from 'react'

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

    let ngOnChangeRemoveListeners: (() => void)[] | undefined

    if (key === 'slots') {
      async function ngChangedCallback() {
        setState(await ncoState!.get(key))
      }

      ngOnChangeRemoveListeners = [
        settings.onChange(
          'settings:comment:hideAssistedComments',
          ngChangedCallback
        ),
        settings.onChange('settings:ng:words', ngChangedCallback),
        settings.onChange('settings:ng:commands', ngChangedCallback),
        settings.onChange('settings:ng:ids', ngChangedCallback),
        settings.onChange('settings:ng:largeComments', ngChangedCallback),
        settings.onChange('settings:ng:fixedComments', ngChangedCallback),
        settings.onChange('settings:ng:coloredComments', ngChangedCallback),
      ]
    }

    const onChangeRemoveListener = ncoState.onChange(key, setState)

    return () => {
      onChangeRemoveListener()

      while (ngOnChangeRemoveListeners?.length) {
        ngOnChangeRemoveListeners.pop()?.()
      }
    }
  }, [])

  return state
}
