# Feature Spec: Session Replay System

**Feature ID:** VF-001
**Version:** 1.0
**Status:** Proposed
**Priority:** HIGH
**Target Release:** v1.1.0
**Estimated Effort:** 3 weeks
**Owner:** TBD

---

## Executive Summary

Enable users to record, replay, and share Claude Code sessions with VCR-like controls. This feature allows developers to:
- Debug complex multi-tool workflows
- Create tutorials and demonstrations
- Share problem reproductions with team members
- Analyze decision-making processes

**Key Differentiator:** First tool to offer time-travel debugging for AI pair programming sessions.

---

## Problem Statement

### Current Pain Points
1. **No session history** - Once Claude finishes, the workflow is lost
2. **Difficult to debug** - Can't replay what Claude did step-by-step
3. **Hard to share context** - Screenshots/logs don't capture the full picture
4. **No learning from past** - Can't review and improve prompt strategies

### User Stories
```
AS A developer
I WANT TO replay past sessions
SO THAT I can understand what went wrong and debug issues

AS A team lead
I WANT TO share session recordings
SO THAT I can onboard new team members with real examples

AS A teacher
I WANT TO create tutorial replays
SO THAT students can learn effective Claude usage patterns

AS A support engineer
I WANT TO see customer session replays
SO THAT I can diagnose and resolve issues faster
```

---

## Goals & Success Metrics

### Goals
1. **Record** all Claude activity with zero performance impact
2. **Replay** sessions with smooth playback and controls
3. **Share** recordings via secure links
4. **Export** to video format for presentations

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Recording overhead | <5% CPU | Performance monitoring |
| Replay smoothness | 60 FPS | Frame rate tracking |
| Share adoption | >40% of users | Analytics |
| Export quality | 1080p @ 30fps | Video analysis |
| Storage efficiency | <100KB/min | Database size |

### Non-Goals
- Live streaming (future feature)
- Screen recording beyond Vibecraft
- Voice recording (privacy concerns)

---

## Technical Design

### Architecture

```
┌─────────────────────────────────────────────────┐
│                 EventBus                        │
│  (existing event stream)                        │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│            ReplayRecorder                       │
│  • Captures events                              │
│  • Adds timing metadata                         │
│  • Compresses payload                           │
│  • Persists to database                         │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│          Supabase: replays table               │
│  • replay_id, user_id, session_id              │
│  • events (JSONB array)                        │
│  • duration, created_at                        │
│  • is_public, share_token                      │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│            ReplayPlayer                         │
│  • Loads replay data                            │
│  • Emits events at recorded timing              │
│  • Provides playback controls                   │
│  • Syncs with 3D scene                          │
└─────────────────────────────────────────────────┘
```

### Data Model

```sql
-- New table: replays
CREATE TABLE replays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  session_id text NOT NULL,
  title text,
  description text,
  events jsonb NOT NULL,  -- Array of timestamped events
  metadata jsonb,  -- duration, tool_counts, file_counts
  is_public boolean DEFAULT false,
  share_token text UNIQUE,  -- For public sharing
  thumbnail_url text,  -- Preview image
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_replays_user_id ON replays(user_id);
CREATE INDEX idx_replays_share_token ON replays(share_token) WHERE is_public;
CREATE INDEX idx_replays_created_at ON replays(created_at DESC);

-- RLS policies
ALTER TABLE replays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own replays"
  ON replays FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own replays"
  ON replays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Annotations for replay
CREATE TABLE replay_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  replay_id uuid REFERENCES replays(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  timestamp_ms integer NOT NULL,  -- When in replay
  text text NOT NULL,
  position jsonb,  -- Optional 3D position
  created_at timestamptz DEFAULT now()
);
```

### Event Recording Format

```typescript
interface RecordedEvent extends ClaudeEvent {
  // Original event fields +
  recorded_at: number  // Epoch ms when recorded
  relative_time_ms: number  // Ms since replay start
  scene_state?: {
    camera_position: { x: number, y: number, z: number }
    focused_zone: string | null
    active_modals: string[]
  }
}

interface ReplayMetadata {
  duration_ms: number
  event_count: number
  tool_breakdown: Record<ToolName, number>
  files_touched: string[]
  session_name: string
  recorded_date: string
}
```

### API Endpoints

```typescript
// Start recording (auto-starts with session)
POST /api/replays/start
Body: { session_id: string, title?: string }
Response: { replay_id: string }

// Stop recording
POST /api/replays/stop
Body: { replay_id: string }
Response: { replay: Replay, metadata: ReplayMetadata }

// List replays
GET /api/replays
Query: { user_id?, limit?, offset? }
Response: { replays: Replay[] }

// Get replay
GET /api/replays/:replay_id
Response: { replay: Replay, events: RecordedEvent[] }

// Share replay
POST /api/replays/:replay_id/share
Body: { is_public: boolean }
Response: { share_url: string, share_token: string }

// Export replay to video
POST /api/replays/:replay_id/export
Body: { format: 'mp4' | 'webm', resolution: '720p' | '1080p' }
Response: { job_id: string, status: 'queued' }

// Get export status
GET /api/replays/exports/:job_id
Response: { status: 'queued' | 'processing' | 'complete', download_url?: string }
```

---

## User Interface

### Replay Controls

```
┌─────────────────────────────────────────────────────────┐
│  Replay: "Implement auth system" (5:32)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ◀◀  ▶️  ▶▶     [========●==============]    🔇  💾  📤 │
│  -10s Play +10s                           1x Speed      │
│                                                          │
│  Current: 2:15 / 5:32                                   │
│  Tool: Edit - src/auth.ts                               │
│                                                          │
│  📝 Add annotation    🔖 Bookmark    ⏱️ Go to time     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Speed Controls
- 0.5x, 1x, 2x, 4x, 8x playback speeds
- Frame-by-frame stepping (Shift + arrow keys)
- Jump to events (click timeline markers)

### Timeline Visualization

```
Events:  ▌  ▌▌ ▌    ▌▌▌  ▌  ▌
        ─┴──┴┴─┴────┴┴┴──┴──┴──────►
        0:00        3:00        5:32

Tools:   📖 ✏️ 🖊️ 💻  ✏️✏️  🔍 📖
```

### Annotation UI

```
Click anywhere on timeline or scene to add annotation:

┌──────────────────────────┐
│ Add Annotation           │
├──────────────────────────┤
│ Timestamp: 2:15          │
│                          │
│ Note:                    │
│ ┌──────────────────────┐ │
│ │ Here Claude made a   │ │
│ │ good refactor        │ │
│ └──────────────────────┘ │
│                          │
│  [Cancel]  [Add]         │
└──────────────────────────┘
```

### Replay Browser

```
┌─────────────────────────────────────────────────────┐
│  My Replays                    [+ New Recording]     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🎬 Implement auth system              5:32         │
│     Jan 15, 2026 • 12 events • 3 files              │
│     [▶️ Play]  [📤 Share]  [💾 Export]              │
│                                                      │
│  🎬 Debug API integration              12:45        │
│     Jan 14, 2026 • 45 events • 8 files              │
│     [▶️ Play]  [📤 Share]  [💾 Export]              │
│                                                      │
│  🎬 Refactor database layer            8:20         │
│     Jan 13, 2026 • 28 events • 5 files              │
│     [▶️ Play]  [📤 Share]  [💾 Export]  [🗑️]       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Core Recording (Week 1)
**Tasks:**
- [ ] Create `ReplayRecorder` class
- [ ] Add database migration for `replays` table
- [ ] Hook into EventBus to capture events
- [ ] Implement event buffering and compression
- [ ] Add auto-save every 30 seconds
- [ ] Create API endpoints for start/stop

**Deliverables:**
- Working event recording
- Data persisted to Supabase
- Basic API endpoints

**Tests:**
- Unit tests for ReplayRecorder
- Integration test: record 100 events
- Performance test: <5% overhead

### Phase 2: Playback Engine (Week 2)
**Tasks:**
- [ ] Create `ReplayPlayer` class
- [ ] Implement event replay at correct timing
- [ ] Add playback speed controls (0.5x - 8x)
- [ ] Sync with 3D scene state
- [ ] Build timeline scrubber UI
- [ ] Add keyboard shortcuts

**Deliverables:**
- Smooth replay playback
- VCR-like controls
- Timeline visualization

**Tests:**
- Playback timing accuracy ±10ms
- UI responsive at all speeds
- Memory usage stable during replay

### Phase 3: Sharing & Export (Week 3)
**Tasks:**
- [ ] Implement share link generation
- [ ] Add public replay viewer (no login)
- [ ] Build video export pipeline
- [ ] Integrate with video encoding service
- [ ] Add annotation system
- [ ] Build replay browser UI

**Deliverables:**
- Shareable replay links
- MP4/WebM export
- Annotation system
- Replay library UI

**Tests:**
- Share links work without login
- Video export quality check
- Annotation persistence

---

## Dependencies

### Internal
- EventBus must emit all events consistently
- Scene state must be serializable
- Database schema must support large JSONB arrays

### External
- **Video encoding service** - FFmpeg or cloud service (AWS MediaConvert)
- **Storage** - For exported videos (S3 or similar)
- **Compression** - zstd or similar for event payload

### Breaking Changes
None - purely additive feature

---

## Security & Privacy

### Concerns
1. **Sensitive data in events** - API keys, secrets, PII
2. **Public sharing** - Unintentional exposure
3. **Storage costs** - Large replay files

### Mitigations
```typescript
// Redact sensitive data before recording
function redactEvent(event: ClaudeEvent): RecordedEvent {
  const redacted = { ...event }

  // Redact common secrets
  if (redacted.toolInput) {
    redacted.toolInput = redactSecrets(redacted.toolInput)
  }

  // Redact file content (store only paths)
  if (redacted.tool === 'Read') {
    delete redacted.toolResponse?.content
  }

  return redacted
}
```

### Access Control
- Private by default
- Share requires explicit action
- Share tokens expire after 30 days (configurable)
- Can revoke share access anytime

---

## Performance Considerations

### Recording Overhead
- **Target:** <5% CPU, <50MB RAM
- **Strategy:** Buffered writes every 5 seconds
- **Compression:** zstd level 3 (good balance)

### Storage Efficiency
- **Target:** <100KB per minute of replay
- **Strategy:**
  - Store event diffs, not full payloads
  - Compress with zstd
  - Deduplicate repeated data

### Playback Performance
- **Target:** 60 FPS during replay
- **Strategy:**
  - Pre-load next 10 seconds of events
  - Use requestAnimationFrame for timing
  - Offload compression to Web Worker

---

## Testing Strategy

### Unit Tests
```typescript
describe('ReplayRecorder', () => {
  it('should capture events with accurate timing')
  it('should compress events efficiently')
  it('should handle rapid event bursts')
  it('should redact sensitive data')
})

describe('ReplayPlayer', () => {
  it('should replay events at correct timing')
  it('should support speed controls')
  it('should sync with scene state')
  it('should handle playback seeking')
})
```

### Integration Tests
```typescript
describe('Replay End-to-End', () => {
  it('should record and replay a full session')
  it('should export replay to video')
  it('should share replay via link')
  it('should allow annotations')
})
```

### Performance Tests
- Record 1000 events → verify <5% overhead
- Replay 1 hour session → verify smooth playback
- Export to video → verify <2x realtime encoding

---

## Monitoring & Metrics

### Key Metrics
```typescript
interface ReplayMetrics {
  recordings_created: number
  recordings_played: number
  replays_shared: number
  exports_requested: number

  avg_recording_size_kb: number
  avg_replay_duration_min: number
  p95_playback_fps: number

  storage_used_gb: number
}
```

### Alerts
- Recording overhead >10% → investigate
- Export queue >100 jobs → scale workers
- Storage growth >1TB/month → review retention

---

## Documentation

### User Guide
- How to record a session
- How to replay and navigate
- How to share with team
- How to export to video
- How to add annotations

### API Documentation
- REST endpoints
- WebSocket messages
- Event format
- Share token format

### Developer Guide
- ReplayRecorder architecture
- Adding new event types
- Extending annotation system

---

## Future Enhancements

### v1.2
- **Live streaming** - Stream session in real-time
- **Collaborative annotations** - Team comments on replays
- **Replay editing** - Trim, splice, annotate

### v1.3
- **Replay collections** - Group related replays
- **Search & filter** - Find replays by tool, file, date
- **Automatic highlights** - AI-generated "best moments"

### v2.0
- **Replay diff view** - Compare two sessions side-by-side
- **Session templates** - Create replay-based templates
- **AI analysis** - "Claude made 3 inefficient prompts here"

---

## Open Questions

1. **Retention policy?** How long to keep replays?
   - Proposal: 30 days free, 1 year pro, unlimited enterprise

2. **Video quality vs file size?** What resolution?
   - Proposal: 720p default, 1080p for pro users

3. **Annotation permissions?** Can viewers annotate shared replays?
   - Proposal: Owner only, unless workspace member

4. **Export format?** MP4, WebM, or both?
   - Proposal: MP4 for compatibility, WebM for size

---

## Approval

**Product:** _______________  Date: ___/___/___
**Engineering:** _______________  Date: ___/___/___
**Design:** _______________  Date: ___/___/___

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | System | Initial specification |

---

## References

- [Feature Roadmap](../docs/FEATURE_ROADMAP.md)
- [Architecture Docs](../docs/ARCHITECTURE.md)
- [API Reference](../docs/API.md)
- [Supabase Schema](../docs/STORAGE.md)
