import type { StatePlayingVideo } from '@/ncoverlay/state'

import { useEffect, useRef, useState } from 'react'

import { logger } from '@/utils/logger'
import { webext } from '@/utils/webext'
import { NCOPatcher } from '@/ncoverlay/patcher'

import { Layout } from '@/components/Layout'

import { VideoPlayer } from './skin'

import './style.css'

const FILE_EXT_REGEXP = /\.[a-z0-9]+$/i

async function getThumbnailURL(): Promise<string> {
  const url = webext.runtime.getURL('/thumbnail.png')
  const blob = await fetch(url).then((res) => res.blob())
  return URL.createObjectURL(blob)
}

function App() {
  const [statePlayingVideo, setStatePlayingVideo] =
    useState<StatePlayingVideo | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [thumbObjUrl, setThumbObjUrl] = useState<string | null>(null)

  const videoFilePicker = useRef<HTMLInputElement>(null)
  const videoFileDrop = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const patcher = new NCOPatcher('_local', {
    getInfo: async () => {
      if (!videoRef.current) {
        return null
      }

      const title = statePlayingVideo?.name.replace(FILE_EXT_REGEXP, '')
      const duration = videoRef.current.duration

      logger.log('title', title)
      logger.log('duration', duration)

      return title
        ? {
            input: title,
            duration,
          }
        : null
    },
    appendCanvas: (video, canvas) => {
      video.insertAdjacentElement('afterend', canvas)
    },
  })

  async function onChange(
    evt:
      | React.ChangeEvent<HTMLInputElement, HTMLInputElement>
      | React.MouseEvent<HTMLInputElement, MouseEvent>
  ) {
    evt.preventDefault()

    const file = evt.currentTarget.files?.[0]

    if (!file) return

    patcher.dispose()

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }

    setStatePlayingVideo({
      type: file.type,
      name: file.name,
      size: file.size,
    })
    setVideoUrl(URL.createObjectURL(file))

    const title = file.name.replace(FILE_EXT_REGEXP, '')

    document.title = `${title} | NCOverlay`
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'NCOverlay',
      artwork: thumbObjUrl ? [{ src: thumbObjUrl }] : undefined,
    })
  }

  useEffect(() => {
    if (!videoRef.current) return

    patcher.setVideo(videoRef.current)

    getThumbnailURL().then(setThumbObjUrl)

    return () => {
      patcher.dispose()

      if (thumbObjUrl) {
        URL.revokeObjectURL(thumbObjUrl)
      }
    }
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
        <VideoPlayer
          src={videoUrl}
          ref={videoRef}
          videoEvents={{
            onLoadedMetadata: ({ currentTarget }) => {
              patcher.setVideo(currentTarget, statePlayingVideo)
            },
          }}
        />
      </div>

      {!videoUrl && (
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
