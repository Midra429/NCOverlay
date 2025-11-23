import { useNcoState } from '@/hooks/useNco'

export function SelectCommentFiles() {
  const stateStatus = useNcoState('status')

  return stateStatus === 'ready' ? <></> : <></>
}
