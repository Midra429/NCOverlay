import { Layout } from '@/components/Layout'

import { VideoPlayer } from './skin'

import './style.css'

function App() {
  return (
    <Layout className="relative h-screen w-screen overflow-hidden">
      <input type="file" accept="video/*" id="video-file-picker" hidden />

      <div className="size-full bg-black">
        <VideoPlayer id="player" />

        <div
          id="onboarding"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="text-medium text-white">
            <p>動画ファイルをこのページにドラッグ&ドロップするか、</p>
            <p>このページ上で右クリックしてファイル選択画面を開いてください</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
