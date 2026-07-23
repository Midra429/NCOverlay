import type { NCOverlay } from '@/ncoverlay'
import type { SettingItems } from '@/types/storage'
import type { captureTab } from '@/utils/extension/captureTab'
import type { setBadge } from '@/utils/extension/setBadge'
import type { Browser } from '@/utils/webext'

import { defineMessaging } from '@/utils/messaging'

export interface ProtocolMap {
  // background -> content
  'content:getNcoId': (args?: null) => number | null
  'content:getCurrentTime': (args?: null) => number
  'content:rerender': (args?: null) => void
  'content:reload': (args?: null) => void
  'content:jumpMarker': (
    args: Parameters<NCOverlay['jumpMarker']>[0]
  ) => ReturnType<NCOverlay['jumpMarker']>
  'content:capture': (args: SettingItems['capture:format']) => {
    format: 'jpeg' | 'png'
    data?: number[]
  }
  'content:selectVideoFile': (args?: null) => void

  // content -> background
  'bg:getCurrentTab': (args?: null) => Browser.tabs.Tab
  'bg:setBadge': (
    args: Parameters<typeof setBadge>[0]
  ) => Awaited<ReturnType<typeof setBadge>>
  'bg:captureTab': (
    args: Parameters<typeof captureTab>[0]
  ) => Awaited<ReturnType<typeof captureTab>>
  'bg:openPopout': (args: {
    type: 'action' | 'sidePanel'
    createData: Browser.OpenPopoutCreateData
  }) => void
  'bg:timeupdate': (args: { id: number; time: number }) => void
}

export const {
  sendMessage: sendExtensionMessage,
  onMessage: onExtensionMessage,
} = defineMessaging<ProtocolMap>()
