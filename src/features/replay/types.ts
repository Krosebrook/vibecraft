/**
 * Session Replay Types
 *
 * Defines interfaces for recording and playing back Claude sessions
 */

import type { ClaudeEvent } from '../../../shared/types'

export interface Replay {
  id: string
  userId: string
  sessionId: string
  name: string
  description?: string
  duration: number
  eventCount: number
  metadata: ReplayMetadata
  createdAt: string
  updatedAt: string
}

export interface ReplayMetadata {
  cwd?: string
  flags?: Record<string, boolean>
  stats?: {
    toolsUsed: number
    filesEdited: number
    commandsRun: number
  }
}

export interface ReplayEvent {
  id: string
  replayId: string
  timestamp: string
  offsetMs: number
  type: string
  tool?: string
  data: ClaudeEvent
  createdAt: string
}

export interface ReplayRecording {
  replay: Replay
  events: ReplayEvent[]
}

export type ReplayState = 'idle' | 'recording' | 'playing' | 'paused'

export interface ReplayPlayerState {
  state: ReplayState
  currentTime: number
  duration: number
  playbackSpeed: number
  currentEventIndex: number
}
