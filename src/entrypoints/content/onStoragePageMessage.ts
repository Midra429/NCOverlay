import { storagePageMessenger } from '@/utils/storage/page-messaging'
import { storage } from '@/utils/storage/extension'

export default () => {
  storagePageMessenger.onMessage('get', ({ data }) => {
    return storage.get(...data)
  })

  storagePageMessenger.onMessage('set', ({ data }) => {
    return storage.set(...data)
  })

  storagePageMessenger.onMessage('remove', ({ data }) => {
    return storage.remove(...data)
  })
}
