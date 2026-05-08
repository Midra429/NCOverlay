import type { CSSProperties, ComponentProps, ReactNode } from 'react'

import { forwardRef } from 'react'
import {
  Maximize2Icon,
  Minimize2Icon,
  Volume1Icon,
  Volume2Icon,
  VolumeOffIcon,
} from 'lucide-react'
import {
  BufferingIndicator,
  Container,
  Controls,
  FullscreenButton,
  Gesture,
  Hotkey,
  MuteButton,
  PlayButton,
  PlaybackRateButton,
  Popover,
  SeekButton,
  Time,
  TimeSlider,
  VolumeSlider,
  bufferFeature,
  controlsFeature,
  createPlayer,
  fullscreenFeature,
  playbackFeature,
  playbackRateFeature,
  timeFeature,
  usePlayer,
  volumeFeature,
} from '@videojs/react'
import { Video } from '@videojs/react/video'

import '@videojs/react/video/skin.css'

// ================================================================
// Player
// ================================================================

const SEEK_TIME = 10

export const Player = createPlayer({
  features: [
    playbackFeature,
    playbackRateFeature,
    volumeFeature,
    timeFeature,
    bufferFeature,
    fullscreenFeature,
    controlsFeature,
  ],
})

export interface VideoPlayerProps {
  src?: string | null
  style?: CSSProperties
  className?: string
  ref?: React.RefObject<HTMLVideoElement | null>
  videoEvents?: Omit<
    React.DOMAttributes<HTMLVideoElement>,
    'children' | 'dangerouslySetInnerHTML'
  >
}

export function VideoPlayer({
  src,
  className,
  ref,
  videoEvents,
  ...rest
}: VideoPlayerProps): ReactNode {
  return (
    <Player.Provider>
      <Container
        className={`media-default-skin media-default-skin--video ${className ?? ''}`}
        {...rest}
      >
        <Video src={src ?? undefined} playsInline ref={ref} {...videoEvents} />

        <BufferingIndicator
          render={(props) => (
            <div {...props} className="media-buffering-indicator">
              <div className="media-surface">
                <SpinnerIcon className="media-icon" />
              </div>
            </div>
          )}
        />

        <Controls.Root className="media-surface media-controls">
          <div className="media-button-group">
            <PlayButton className="media-button--play" render={<Button />}>
              <RestartIcon className="media-icon media-icon--restart" />
              <PlayIcon className="media-icon media-icon--play" />
              <PauseIcon className="media-icon media-icon--pause" />
            </PlayButton>

            <SeekButton
              seconds={-SEEK_TIME}
              className="media-button--seek"
              render={<Button />}
            >
              <span className="media-icon__container">
                <SeekIcon className="media-icon media-icon--seek media-icon--flipped" />
                <span className="media-icon__label">{SEEK_TIME}</span>
              </span>
            </SeekButton>

            <SeekButton
              seconds={SEEK_TIME}
              className="media-button--seek"
              render={<Button />}
            >
              <span className="media-icon__container">
                <SeekIcon className="media-icon media-icon--seek" />
                <span className="media-icon__label">{SEEK_TIME}</span>
              </span>
            </SeekButton>
          </div>

          <div className="media-time-controls">
            <Time.Value type="current" className="media-time" />
            <TimeSlider.Root className="media-slider" changeThrottle={1000}>
              <TimeSlider.Track className="media-slider__track">
                <TimeSlider.Fill className="media-slider__fill" />
                <TimeSlider.Buffer className="media-slider__buffer" />
              </TimeSlider.Track>
              <TimeSlider.Thumb className="media-slider__thumb" />
            </TimeSlider.Root>
            <Time.Value type="duration" className="media-time" />
          </div>

          <div className="media-button-group">
            <PlaybackRateButton
              className="media-button--playback-rate"
              render={<Button />}
            />

            <VolumePopover />

            <FullscreenButton
              className="media-button--fullscreen"
              render={<Button />}
            >
              <Maximize2Icon
                className="media-icon media-icon--fullscreen-enter"
                strokeWidth={2.5}
              />
              <Minimize2Icon
                className="media-icon media-icon--fullscreen-exit"
                strokeWidth={2.5}
              />
            </FullscreenButton>
          </div>
        </Controls.Root>

        <div className="media-overlay" />

        {/* Hotkeys */}
        <Hotkey keys="Space" action="togglePaused" />
        <Hotkey keys="k" action="togglePaused" />
        <Hotkey keys="m" action="toggleMuted" />
        <Hotkey keys="f" action="toggleFullscreen" />
        <Hotkey keys="c" action="toggleSubtitles" />
        <Hotkey keys="i" action="togglePictureInPicture" />
        <Hotkey keys="ArrowRight" action="seekStep" value={5} />
        <Hotkey keys="ArrowLeft" action="seekStep" value={-5} />
        <Hotkey keys="l" action="seekStep" value={10} />
        <Hotkey keys="j" action="seekStep" value={-10} />
        <Hotkey keys="ArrowUp" action="volumeStep" value={0.05} />
        <Hotkey keys="ArrowDown" action="volumeStep" value={-0.05} />
        <Hotkey keys="0-9" action="seekToPercent" />
        <Hotkey keys="Home" action="seekToPercent" value={0} />
        <Hotkey keys="End" action="seekToPercent" value={100} />
        <Hotkey keys=">" action="speedUp" />
        <Hotkey keys="<" action="speedDown" />

        {/* Gestures */}
        <Gesture
          type="tap"
          action="togglePaused"
          pointer="mouse"
          region="center"
        />
        <Gesture type="tap" action="toggleControls" pointer="touch" />
        <Gesture type="doubletap" action="seekStep" value={-10} region="left" />
        <Gesture type="doubletap" action="toggleFullscreen" region="center" />
        <Gesture type="doubletap" action="seekStep" value={10} region="right" />
      </Container>
    </Player.Provider>
  )
}

// ================================================================
// Components
// ================================================================

const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  function Button({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={`media-button media-button--subtle media-button--icon ${className ?? ''}`}
        {...props}
      />
    )
  }
)

function VolumePopover(): ReactNode {
  const volumeUnsupported = usePlayer(
    (s) => s.volumeAvailability === 'unsupported'
  )

  const muteButton = (
    <MuteButton className="media-button--mute" render={<Button />}>
      <VolumeOffIcon
        className="media-icon media-icon--volume-off"
        strokeWidth={2.5}
      />
      <Volume1Icon
        className="media-icon media-icon--volume-low"
        strokeWidth={2.5}
      />
      <Volume2Icon
        className="media-icon media-icon--volume-high"
        strokeWidth={2.5}
      />
    </MuteButton>
  )

  if (volumeUnsupported) return muteButton

  return (
    <Popover.Root openOnHover delay={200} closeDelay={100} side="top">
      <Popover.Trigger render={muteButton} />
      <Popover.Popup className="media-surface media-popover media-popover--volume">
        <VolumeSlider.Root
          className="media-slider"
          orientation="vertical"
          thumbAlignment="edge"
        >
          <VolumeSlider.Track className="media-slider__track">
            <VolumeSlider.Fill className="media-slider__fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="media-slider__thumb media-slider__thumb--persistent" />
        </VolumeSlider.Root>
      </Popover.Popup>
    </Popover.Root>
  )
}

function PauseIcon(props: ComponentProps<'svg'>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <rect width="5" height="14" x="2" y="2" fill="currentColor" rx="1.75" />
      <rect width="5" height="14" x="11" y="2" fill="currentColor" rx="1.75" />
    </svg>
  )
}

function PlayIcon(props: ComponentProps<'svg'>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="m14.051 10.723-7.985 4.964a1.98 1.98 0 0 1-2.758-.638A2.06 2.06 0 0 1 3 13.964V4.036C3 2.91 3.895 2 5 2c.377 0 .747.109 1.066.313l7.985 4.964a2.057 2.057 0 0 1 .627 2.808c-.16.257-.373.475-.627.637"
      />
    </svg>
  )
}

function RestartIcon(props: ComponentProps<'svg'>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M9 17a8 8 0 0 1-8-8h2a6 6 0 1 0 1.287-3.713l1.286 1.286A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"
      />
      <path
        fill="currentColor"
        d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"
      />
    </svg>
  )
}

function SeekIcon(props: ComponentProps<'svg'>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M1 9c0 2.21.895 4.21 2.343 5.657l1.414-1.414a6 6 0 1 1 8.956-7.956l-1.286 1.286a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"
      />
    </svg>
  )
}

function SpinnerIcon(props: ComponentProps<'svg'>): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <rect width="2" height="5" x="8" y=".5" opacity=".5" rx="1">
        <animate
          attributeName="opacity"
          begin="0s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="2"
        height="5"
        x="12.243"
        y="2.257"
        opacity=".45"
        rx="1"
        transform="rotate(45 13.243 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.125s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="5" height="2" x="12.5" y="8" opacity=".4" rx="1">
        <animate
          attributeName="opacity"
          begin="0.25s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="5"
        height="2"
        x="10.743"
        y="12.243"
        opacity=".35"
        rx="1"
        transform="rotate(45 13.243 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.375s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="2" height="5" x="8" y="12.5" opacity=".3" rx="1">
        <animate
          attributeName="opacity"
          begin="0.5s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="2"
        height="5"
        x="3.757"
        y="10.743"
        opacity=".25"
        rx="1"
        transform="rotate(45 4.757 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.625s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="5" height="2" x=".5" y="8" opacity=".15" rx="1">
        <animate
          attributeName="opacity"
          begin="0.75s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="5"
        height="2"
        x="2.257"
        y="3.757"
        opacity=".1"
        rx="1"
        transform="rotate(45 4.757 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.875s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
    </svg>
  )
}
