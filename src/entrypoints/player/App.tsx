import type { StatePlayingVideo } from '@/ncoverlay/state'

import { useEffect, useRef, useState } from 'react'
import {
  bufferFeature,
  controlsFeature,
  createPlayer,
  fullscreenFeature,
  playbackFeature,
  playbackRateFeature,
  textTrackFeature,
  timeFeature,
  volumeFeature,
} from '@videojs/react'
import { Video, VideoSkin } from '@videojs/react/video'

import { logger } from '@/utils/logger'
import { NCOPatcher } from '@/ncoverlay/patcher'

import { Layout } from '@/components/Layout'

import '@videojs/react/video/skin.css'
import './style.css'

const FILE_EXT_REGEXP = /\.[a-z0-9]+$/i

const Player = createPlayer({
  features: [
    playbackFeature,
    playbackRateFeature,
    volumeFeature,
    timeFeature,
    bufferFeature,
    fullscreenFeature,
    controlsFeature,
    textTrackFeature,
  ],
})

function App() {
  const [statePlayingVideo, setStatePlayingVideo] =
    useState<StatePlayingVideo | null>(null)
  const [fileObjUrl, setFileObjUrl] = useState<string | null>(null)

  const videoFilePicker = useRef<HTMLInputElement>(null)
  const videoFileDrop = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const patcher = new NCOPatcher('_local', {
    getInfo: async () => {
      if (!videoRef.current) {
        return null
      }

      const fileName = statePlayingVideo?.name.replace(FILE_EXT_REGEXP, '')
      const duration = videoRef.current.duration

      logger.log('fileName', fileName)
      logger.log('duration', duration)

      return fileName
        ? {
            input: fileName,
            duration,
          }
        : null
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  function onChange(
    evt:
      | React.ChangeEvent<HTMLInputElement, HTMLInputElement>
      | React.MouseEvent<HTMLInputElement, MouseEvent>
  ) {
    evt.preventDefault()

    const files = evt.currentTarget.files

    if (!files?.length) return

    patcher.dispose()

    if (fileObjUrl) {
      URL.revokeObjectURL(fileObjUrl)
    }

    const [file] = files

    setStatePlayingVideo({
      type: file.type,
      name: file.name,
      size: file.size,
    })
    setFileObjUrl(URL.createObjectURL(file))

    document.title = `${file.name} | NCOverlay`

    navigator.mediaSession.metadata = new MediaMetadata({
      title: file.name,
    })
  }

  useEffect(() => {
    if (!videoRef.current) return

    patcher.setVideo(videoRef.current)

    return () => patcher.dispose()
  }, [])

  return (
    <Layout className="relative h-screen w-screen overflow-hidden">
      <input
        type="file"
        accept="video/*"
        id="video-file-picker"
        hidden
        onChange={(evt) => {
          onChange(evt)

          videoFileDrop.current!.files = null
        }}
        ref={videoFilePicker}
      />
      <input
        type="file"
        accept="video/*"
        id="video-file-drop"
        hidden
        onClick={(evt) => {
          onChange(evt)

          videoFilePicker.current!.files = null
        }}
        ref={videoFileDrop}
      />

      <div
        className="size-full bg-black"
        onContextMenu={(evt) => {
          evt.preventDefault()

          videoFilePicker.current?.click()
        }}
      >
        <Player.Provider>
          <VideoSkin
            className="rounded-none! outline-none!"
            style={{
              visibility: fileObjUrl ? undefined : 'hidden',
            }}
          >
            <Video
              src={fileObjUrl ?? undefined}
              playsInline
              onLoadedMetadata={({ currentTarget }) => {
                patcher.setVideo(currentTarget, statePlayingVideo)
              }}
              ref={videoRef}
            />
          </VideoSkin>
        </Player.Provider>
      </div>

      {!fileObjUrl && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-medium text-white">
            <p>動画ファイルをこのページにドラッグ&ドロップするか、</p>
            <p>このページ上で右クリックしてファイル選択画面を開いてください</p>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default App
