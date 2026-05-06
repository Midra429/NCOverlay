import { ncoState, useNcoState } from '@/hooks/useNco'

import { Layout } from '@/components/Layout'

import { DisplayedComments } from './DisplayedComments'
import { MainTabs } from './MainTabs'
import { Settings } from './MainTabs/Settings'
import { PlayingVideo } from './PlayingVideo'

function App() {
  const vod = useNcoState('vod')

  const isActive = !!ncoState

  return (
    <Layout className="overflow-visible">
      <div
        className="flex w-fit flex-row *:h-full"
        style={{
          height: isActive ? 585 : 508,
        }}
      >
        {isActive && (
          <div className="flex w-107 flex-col border-foreground-200 border-r-1">
            {vod === '_local' && <PlayingVideo />}

            <DisplayedComments />
          </div>
        )}

        <div className="flex w-93 flex-col">
          {isActive ? (
            <MainTabs />
          ) : (
            <div className="h-full overflow-y-auto">
              <Settings />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default App
