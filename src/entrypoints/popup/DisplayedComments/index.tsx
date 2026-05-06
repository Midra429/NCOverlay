import { PositionControl } from '@/components/PositionControl'

import { Header } from './Header'
import { Items } from './Items'

export function DisplayedComments() {
  return (
    <>
      <Header />

      <Items />

      <PositionControl className="border-foreground-200 border-t-1" compact />
    </>
  )
}
