/**
 * ReplayRecorder - Records Claude session events for later playback
 */

import type { ClaudeEvent } from '../../../shared/types'
import type { Replay, ReplayEvent, ReplayMetadata } from './types'

export class ReplayRecorder {
  private recording: boolean = false
  private sessionId: string | null = null
  private startTime: number = 0
  private events: Array<{ event: ClaudeEvent; timestamp: number }> = []
  private metadata: ReplayMetadata = {}

  isRecording(): boolean {
    return this.recording
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  start(sessionId: string, metadata?: ReplayMetadata): void {
    if (this.recording) {
      console.warn('Already recording')
      return
    }

    this.sessionId = sessionId
    this.startTime = Date.now()
    this.events = []
    this.metadata = metadata || {}
    this.recording = true

    console.log(`Started recording session: ${sessionId}`)
  }

  recordEvent(event: ClaudeEvent): void {
    if (!this.recording) return

    const timestamp = Date.now()
    this.events.push({ event, timestamp })
  }

  stop(): { events: Array<{ event: ClaudeEvent; offsetMs: number }>; duration: number } | null {
    if (!this.recording) {
      console.warn('Not recording')
      return null
    }

    this.recording = false
    const duration = Date.now() - this.startTime

    const eventsWithOffset = this.events.map(({ event, timestamp }) => ({
      event,
      offsetMs: timestamp - this.startTime,
    }))

    console.log(`Stopped recording. Duration: ${duration}ms, Events: ${eventsWithOffset.length}`)

    return {
      events: eventsWithOffset,
      duration,
    }
  }

  cancel(): void {
    this.recording = false
    this.sessionId = null
    this.events = []
    this.startTime = 0
    this.metadata = {}
  }

  async save(name: string, description?: string): Promise<Replay | null> {
    const recordingData = this.stop()
    if (!recordingData || !this.sessionId) {
      console.error('No recording data to save')
      return null
    }

    const replay: Replay = {
      id: crypto.randomUUID(),
      userId: 'current-user',
      sessionId: this.sessionId,
      name,
      description,
      duration: recordingData.duration,
      eventCount: recordingData.events.length,
      metadata: this.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('Replay saved:', {
      id: replay.id,
      name: replay.name,
      duration: replay.duration,
      events: replay.eventCount,
    })

    return replay
  }
}
