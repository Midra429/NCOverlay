import { sendNcoMessage } from '@/ncoverlay/messaging'

export const getNcoId = async (tabId?: number): Promise<string | null> => {
  try {
    return await sendNcoMessage('getId', null, tabId)
  } catch {}

  return null
}
