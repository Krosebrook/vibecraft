/**
 * ReplayControls - UI for replay playback controls
 */

import type { ReplayPlayer } from './ReplayPlayer'
import type { ReplayRecorder } from './ReplayRecorder'

export class ReplayControls {
  private container: HTMLElement | null = null
  private player: ReplayPlayer | null = null
  private recorder: ReplayRecorder | null = null

  constructor() {
    this.createControls()
  }

  private createControls(): void {
    this.container = document.createElement('div')
    this.container.id = 'replay-controls'
    this.container.className = 'replay-controls hidden'
    this.container.innerHTML = `
      <div class="replay-controls-inner">
        <div class="replay-controls-header">
          <span class="replay-controls-title">Session Replay</span>
          <button class="replay-controls-close" title="Close">×</button>
        </div>
        <div class="replay-controls-body">
          <div class="replay-timeline">
            <input type="range" class="replay-slider" min="0" max="100" value="0" step="0.1" />
            <div class="replay-time">
              <span class="replay-time-current">0:00</span>
              <span class="replay-time-sep">/</span>
              <span class="replay-time-total">0:00</span>
            </div>
          </div>
          <div class="replay-buttons">
            <button class="replay-btn replay-btn-play" title="Play">▶</button>
            <button class="replay-btn replay-btn-pause hidden" title="Pause">⏸</button>
            <button class="replay-btn replay-btn-stop" title="Stop">⏹</button>
            <div class="replay-speed">
              <button class="replay-btn replay-btn-speed" title="Playback speed">1x</button>
            </div>
          </div>
          <div class="replay-recording hidden">
            <span class="replay-recording-dot"></span>
            <span class="replay-recording-text">Recording...</span>
            <button class="replay-btn replay-btn-stop-recording">Stop & Save</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(this.container)

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    if (!this.container) return

    const closeBtn = this.container.querySelector('.replay-controls-close')
    const playBtn = this.container.querySelector('.replay-btn-play')
    const pauseBtn = this.container.querySelector('.replay-btn-pause')
    const stopBtn = this.container.querySelector('.replay-btn-stop')
    const speedBtn = this.container.querySelector('.replay-btn-speed')
    const slider = this.container.querySelector('.replay-slider') as HTMLInputElement
    const stopRecordingBtn = this.container.querySelector('.replay-btn-stop-recording')

    closeBtn?.addEventListener('click', () => this.hide())

    playBtn?.addEventListener('click', () => {
      this.player?.play()
      this.updatePlaybackUI()
    })

    pauseBtn?.addEventListener('click', () => {
      this.player?.pause()
      this.updatePlaybackUI()
    })

    stopBtn?.addEventListener('click', () => {
      this.player?.stop()
      this.updatePlaybackUI()
    })

    speedBtn?.addEventListener('click', () => {
      const speeds = [0.25, 0.5, 1, 1.5, 2, 4]
      const currentSpeed = this.player?.getState().playbackSpeed || 1
      const currentIndex = speeds.indexOf(currentSpeed)
      const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
      this.player?.setSpeed(nextSpeed)
      if (speedBtn) speedBtn.textContent = `${nextSpeed}x`
    })

    slider?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      const percentage = parseFloat(target.value)
      const state = this.player?.getState()
      if (state) {
        const timeMs = (percentage / 100) * state.duration
        this.player?.seek(timeMs)
      }
    })

    stopRecordingBtn?.addEventListener('click', () => {
      this.handleStopRecording()
    })
  }

  setPlayer(player: ReplayPlayer): void {
    this.player = player
  }

  setRecorder(recorder: ReplayRecorder): void {
    this.recorder = recorder
  }

  show(): void {
    if (this.container) {
      this.container.classList.remove('hidden')
    }
  }

  hide(): void {
    if (this.container) {
      this.container.classList.add('hidden')
    }
    this.player?.stop()
  }

  showRecording(): void {
    if (!this.container) return
    const recordingUI = this.container.querySelector('.replay-recording')
    const buttonsUI = this.container.querySelector('.replay-buttons')
    if (recordingUI) recordingUI.classList.remove('hidden')
    if (buttonsUI) buttonsUI.classList.add('hidden')
    this.show()
  }

  hideRecording(): void {
    if (!this.container) return
    const recordingUI = this.container.querySelector('.replay-recording')
    const buttonsUI = this.container.querySelector('.replay-buttons')
    if (recordingUI) recordingUI.classList.add('hidden')
    if (buttonsUI) buttonsUI.classList.remove('hidden')
  }

  private async handleStopRecording(): Promise<void> {
    if (!this.recorder || !this.recorder.isRecording()) return

    const name = prompt('Enter a name for this replay:')
    if (!name) return

    const description = prompt('Enter a description (optional):')

    const replay = await this.recorder.save(name, description || undefined)
    if (replay) {
      this.hideRecording()
      this.hide()
      alert(`Replay "${replay.name}" saved successfully!`)
    }
  }

  updatePlaybackUI(): void {
    if (!this.container || !this.player) return

    const state = this.player.getState()
    const playBtn = this.container.querySelector('.replay-btn-play')
    const pauseBtn = this.container.querySelector('.replay-btn-pause')
    const slider = this.container.querySelector('.replay-slider') as HTMLInputElement
    const currentTimeEl = this.container.querySelector('.replay-time-current')
    const totalTimeEl = this.container.querySelector('.replay-time-total')

    if (state.state === 'playing') {
      playBtn?.classList.add('hidden')
      pauseBtn?.classList.remove('hidden')
    } else {
      playBtn?.classList.remove('hidden')
      pauseBtn?.classList.add('hidden')
    }

    if (slider) {
      const percentage = (state.currentTime / state.duration) * 100
      slider.value = String(percentage)
    }

    if (currentTimeEl) {
      currentTimeEl.textContent = this.formatTime(state.currentTime)
    }

    if (totalTimeEl) {
      totalTimeEl.textContent = this.formatTime(state.duration)
    }
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  startUpdateLoop(): void {
    setInterval(() => {
      if (this.player && this.player.getState().state === 'playing') {
        this.updatePlaybackUI()
      }
    }, 100)
  }
}

export const replayControls = new ReplayControls()
