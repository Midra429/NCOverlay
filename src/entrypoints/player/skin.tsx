import type { FlatTranslations } from '@videojs/react'
import type { ComponentProps, ReactNode } from 'react'

import { forwardRef } from 'react'
import { cn } from '@heroui/react'
import {
  BufferingIndicator,
  Container,
  Controls,
  FullscreenButton,
  Gesture,
  Hotkey,
  Menu,
  MuteButton,
  PlayButton,
  Popover,
  SeekButton,
  Time,
  TimeSlider,
  Tooltip,
  VolumeSlider,
  bufferFeature,
  controlsFeature,
  createPlayer,
  createTranslator,
  fullscreenFeature,
  playbackFeature,
  playbackRateFeature,
  selectFullscreen,
  selectPlayback,
  timeFeature,
  usePlaybackRateOptions,
  usePlayer,
  volumeFeature,
} from '@videojs/react'
import ja from '@videojs/react/i18n/locales/ja'
import {
  CheckIcon,
  ChevronIcon,
  FullscreenEnterIcon,
  FullscreenExitIcon,
  GearIcon,
  PauseIcon,
  PlayIcon,
  RestartIcon,
  SeekIcon,
  SpeedIcon,
  SpinnerIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeOffIcon,
} from '@videojs/react/icons'
import { Video } from '@videojs/react/video'
import { flatten } from '@videojs/utils/object'

import '@videojs/react/video/skin.css'

const Player = createPlayer({
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

const t = createTranslator(flatten(ja) as FlatTranslations, 'ja')

function PlaybackControl(): ReactNode {
  const playbackState = usePlayer(selectPlayback)

  return (
    <Tooltip.Root side="top">
      <Tooltip.Trigger
        render={
          <PlayButton className="media-button--play" render={<Button />}>
            <RestartIcon className="media-icon media-icon--restart" />
            <PlayIcon className="media-icon media-icon--play" />
            <PauseIcon className="media-icon media-icon--pause" />
          </PlayButton>
        }
      />
      <Tooltip.Popup className="media-surface media-tooltip">
        <Tooltip.Label>
          {(playbackState?.ended && t('buttons.replay')) ||
            (playbackState?.paused && t('buttons.play')) ||
            (playbackState?.started && t('buttons.pause'))}
        </Tooltip.Label>
        <Tooltip.Shortcut className="media-tooltip__kbd" />
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

function MenuChevron({ flipped }: { flipped?: boolean }): ReactNode {
  return (
    <ChevronIcon
      className={cn(
        'media-icon media-menu__chevron',
        flipped && 'media-icon--flipped'
      )}
    />
  )
}

function SettingsMenu(): ReactNode {
  const playbackRate = usePlaybackRateOptions()
  const hasPlaybackRate = playbackRate?.state.availability === 'available'

  if (!hasPlaybackRate) return null

  return (
    <Menu.Root side="top" align="center">
      <Menu.Trigger
        aria-label={t('menu.settings')}
        className="media-button--settings"
        render={<Button />}
      >
        <GearIcon className="media-icon media-icon--settings" />
      </Menu.Trigger>
      <Menu.Content className="media-surface media-popover media-menu media-menu--settings">
        <Menu.View className="media-menu__panel">
          <div className="media-menu__group">
            {hasPlaybackRate ? (
              <Menu.Root>
                <Menu.Trigger
                  type="playback-rate"
                  className="media-menu__item media-menu__item--submenu"
                  render={(props) => (
                    <div {...props}>
                      <SpeedIcon className="media-icon" />
                      <span>{t('menu.speed')}</span>
                      <span className="media-menu__hint">
                        <Menu.ItemValue className="media-menu__hint-label" />
                        <MenuChevron />
                      </span>
                    </div>
                  )}
                />
                <Menu.Content className="media-menu__panel">
                  <Menu.Back className="media-menu__back">
                    <MenuChevron flipped />
                    {t('menu.speed')}
                  </Menu.Back>
                  <Menu.Separator className="media-menu__separator" />
                  <Menu.RadioGroup
                    className="media-menu__group"
                    value={playbackRate.value}
                    onValueChange={playbackRate.setValue}
                    aria-label={t('menu.playbackRate')}
                  >
                    {playbackRate.options.map((option) => (
                      <Menu.RadioItem
                        key={option.value}
                        className="media-menu__item"
                        value={option.value}
                        disabled={option.disabled}
                      >
                        <span>{option.label}</span>
                        <Menu.ItemIndicator
                          checked={option.value === playbackRate.value}
                          forceMount
                          className="media-menu__indicator"
                        >
                          <CheckIcon className="media-icon" />
                        </Menu.ItemIndicator>
                      </Menu.RadioItem>
                    ))}
                  </Menu.RadioGroup>
                </Menu.Content>
              </Menu.Root>
            ) : null}
          </div>
        </Menu.View>
      </Menu.Content>
    </Menu.Root>
  )
}

function FullscreenControl() {
  const state = usePlayer(selectFullscreen)

  return (
    <Tooltip.Root side="top">
      <Tooltip.Trigger
        render={
          <FullscreenButton
            className="media-button--fullscreen"
            render={<Button />}
          >
            <FullscreenEnterIcon className="media-icon media-icon--fullscreen-enter" />
            <FullscreenExitIcon className="media-icon media-icon--fullscreen-exit" />
          </FullscreenButton>
        }
      />
      <Tooltip.Popup className="media-surface media-tooltip">
        <Tooltip.Label>
          {state?.fullscreen ? t('fullscreen.exit') : t('fullscreen.enter')}
        </Tooltip.Label>
        <Tooltip.Shortcut className="media-tooltip__kbd" />
      </Tooltip.Popup>
    </Tooltip.Root>
  )
}

// ================================================================
// Player
// ================================================================

const SEEK_TIME = 10

export interface VideoPlayerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'children' | 'dangerouslySetInnerHTML'
  > {
  src?: string
}

export function VideoPlayer({
  className,
  style,
  src,
  ...rest
}: VideoPlayerProps): ReactNode {
  return (
    <Player.Provider>
      <Container
        {...rest}
        className={cn(
          'media-default-skin media-default-skin--video',
          className
        )}
      >
        <Video src={src} playsInline />

        <BufferingIndicator
          render={(props) => (
            <div {...props} className="media-buffering-indicator">
              <SpinnerIcon className="media-icon" />
            </div>
          )}
        />

        <Controls.Root className="media-surface media-controls media-controls--root">
          <Tooltip.Provider>
            <div className="media-surface media-controls media-controls--primary">
              <div className="media-button-group">
                <PlaybackControl />

                <Tooltip.Root side="top">
                  <Tooltip.Trigger
                    render={
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
                    }
                  />
                  <Tooltip.Popup className="media-surface media-tooltip">
                    <Tooltip.Label>
                      {t('seek.backward', { seconds: SEEK_TIME })}
                    </Tooltip.Label>
                    <Tooltip.Shortcut className="media-tooltip__kbd" />
                  </Tooltip.Popup>
                </Tooltip.Root>
                <Tooltip.Root side="top">
                  <Tooltip.Trigger
                    render={
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
                    }
                  />
                  <Tooltip.Popup className="media-surface media-tooltip">
                    <Tooltip.Label>
                      {t('seek.forward', { seconds: SEEK_TIME })}
                    </Tooltip.Label>
                    <Tooltip.Shortcut className="media-tooltip__kbd" />
                  </Tooltip.Popup>
                </Tooltip.Root>

                <VolumePopover />
              </div>

              <div className="media-time-controls">
                <Time.Value type="current" className="media-time" />
                <TimeSlider.Root className="media-slider">
                  <TimeSlider.Track className="media-slider__track">
                    <TimeSlider.Fill className="media-slider__fill" />
                    <TimeSlider.Buffer className="media-slider__buffer" />
                  </TimeSlider.Track>
                  <TimeSlider.Thumb className="media-slider__thumb" />

                  <TimeSlider.Preview className="media-slider__preview">
                    <TimeSlider.Value
                      type="pointer"
                      className="media-time media-slider__value"
                    />
                  </TimeSlider.Preview>
                </TimeSlider.Root>
                <Time.Value toggle type="duration" className="media-time" />
              </div>

              <div className="media-button-group">
                <SettingsMenu />
              </div>
            </div>

            <div className="media-surface media-controls media-controls--secondary">
              <div className="media-button-group">
                <FullscreenControl />
              </div>
            </div>
          </Tooltip.Provider>
        </Controls.Root>

        <div className="media-overlay" />

        {/* Hotkeys */}
        <Hotkey keys="Space" action="togglePaused" />
        <Hotkey keys="k" action="togglePaused" />
        <Hotkey keys="m" action="toggleMuted" />
        <Hotkey keys="f" action="toggleFullscreen" />
        <Hotkey keys="c" action="toggleSubtitles" />
        <Hotkey keys="i" action="togglePictureInPicture" />
        <Hotkey keys="ArrowRight" action="seekStep" value={SEEK_TIME / 2} />
        <Hotkey keys="ArrowLeft" action="seekStep" value={-(SEEK_TIME / 2)} />
        <Hotkey keys="l" action="seekStep" value={SEEK_TIME} />
        <Hotkey keys="j" action="seekStep" value={-SEEK_TIME} />
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
        <Gesture
          type="doubletap"
          action="seekStep"
          value={-SEEK_TIME}
          region="left"
        />
        <Gesture type="doubletap" action="toggleFullscreen" region="center" />
        <Gesture
          type="doubletap"
          action="seekStep"
          value={SEEK_TIME}
          region="right"
        />
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
        className={cn(
          'media-button media-button--subtle media-button--icon',
          className
        )}
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
      <VolumeOffIcon className="media-icon media-icon--volume-off" />
      <VolumeLowIcon className="media-icon media-icon--volume-low" />
      <VolumeHighIcon className="media-icon media-icon--volume-high" />
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
