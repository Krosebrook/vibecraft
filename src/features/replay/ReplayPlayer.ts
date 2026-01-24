/**
 * ReplayPlayer - Plays back recorded Claude sessions
 */

import type { ClaudeEvent } from '../../../shared/types'
import type { ReplayRecording, ReplayPlayerState } from './types'

export type PlaybackEventCallback = (event: ClaudeEvent, offsetMs: number) => void

export class ReplayPlayer {
  private state: ReplayPlayerState = {
    state: 'idle',
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    currentEventIndex: 0,
  }

  private recording: ReplayRecording | null = null
  private timeoutId: number | null = null
  private eventCallback: PlaybackEventCallback | null = null
  private lastEventTime: number = 0

  getState(): ReplayPlayerState {
    return { ...this.state }
  }

  load(recording: ReplayRecording): void {
    this.stop()
    this.recording = recording
    this.state = {
      state: 'idle',
      currentTime: 0,
      duration: recording.replay.duration,
      playbackSpeed: 1,
      currentEventIndex: 0,
    }

    console.log(`Loaded replay: ${recording.replay.name}`)
  }

  onEvent(callback: PlaybackEventCallback): void {
    this.eventCallback = callback
  }

  play(): void {
    if (!this.recording) {
      console.warn('No recording loaded')
      return
    }

    if (this.state.state === 'playing') return

    this.state.state = 'playing'
    this.lastEventTime = Date.now()
    this.scheduleNextEvent()
  }

  pause(): void {
    if (this.state.state !== 'playing') return

    this.state.state = 'paused'
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  stop(): void {
    this.state.state = 'idle'
    this.state.currentTime = 0
    this.state.currentEventIndex = 0

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  seek(timeMs: number): void {
    if (!this.recording) return

    const wasPlaying = this.state.state === 'playing'
    if (wasPlaying) this.pause()

    this.state.currentTime = Math.max(0, Math.min(timeMs, this.state.duration))

    const events = this.recording.events
    let newIndex = 0
    for (let i = 0; i < events.length; i++) {
      if (events[i].offsetMs > this.state.currentTime) break
      newIndex = i + 1
    }
    this.state.currentEventIndex = newIndex

    this.lastEventTime = Date.now()

    if (wasPlaying) this.play()
  }

  setSpeed(speed: number): void {
    const validSpeeds = [0.25, 0.5, 1, 1.5, 2, 4]
    this.state.playbackSpeed = validSpeeds.includes(speed) ? speed : 1

    if (this.state.state === 'playing') {
      if (this.timeoutId !== null) clearTimeout(this.timeoutId)
      this.scheduleNextEvent()
    }
  }

  private scheduleNextEvent(): void {
    if (!this.recording || this.state.state !== 'playing') return

    const events = this.recording.events
    const currentIndex = this.state.currentEventIndex

    if (currentIndex >= events.length) {
      this.stop()
      console.log('Replay finished')
      return
    }

    const currentEvent = events[currentIndex]
    const nextEventTime = currentEvent.offsetMs
    const delay = (nextEventTime - this.state.currentTime) / this.state.playbackSpeed

    this.timeoutId = window.setTimeout(() => {
      const now = Date.now()
      const elapsed = now - this.lastEventTime
      this.lastEventTime = now

      this.state.currentTime += elapsed * this.state.playbackSpeed
      this.state.currentEventIndex++

      if (this.eventCallback) {
        this.eventCallback(currentEvent.data, currentEvent.offsetMs)
      }

      this.scheduleNextEvent()
    }, Math.max(0, delay))
  }

  dispose(): void {
    this.stop()
    this.recording = null
    this.eventCallback = null
  }
}
