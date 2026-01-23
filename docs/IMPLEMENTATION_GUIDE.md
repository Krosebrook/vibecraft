# Vibecraft Implementation Guide

Practical guide for implementing the 20-feature roadmap with best practices, patterns, and standards.

## Development Standards

### Spec-Driven Development Process

```
1. Spec Writing (1-2 days)
   ↓
2. Review & Approval (1-2 days)
   ↓
3. Technical Design Doc (1 day)
   ↓
4. Implementation (1-5 weeks)
   ↓
5. Testing (concurrent with implementation)
   ↓
6. Code Review (1-2 days)
   ↓
7. Documentation (1 day)
   ↓
8. Release
```

### Feature Branch Strategy

```bash
# Branch naming
feature/VF-001-session-replay
feature/VF-002-code-intelligence
fix/session-replay-memory-leak
chore/update-dependencies

# Work in Progress
git checkout -b feature/VF-001-session-replay
git commit -m "feat(replay): add event recording"
git push origin feature/VF-001-session-replay

# Create PR when ready
gh pr create --title "feat: Session Replay System (VF-001)" \
  --body "Implements session recording and playback. See spec: specs/01-session-replay.md"
```

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)

# Types
feat: New feature
fix: Bug fix
docs: Documentation only
style: Code style (formatting)
refactor: Code refactoring
test: Add/update tests
chore: Maintenance

# Examples
feat(replay): add session recording
fix(audio): resolve spatial audio crackling
docs(api): update WebSocket protocol
test(replay): add playback timing tests
```

---

## Code Organization Patterns

### Feature Module Structure

```
src/features/session-replay/
├── index.ts              # Public API exports
├── types.ts              # TypeScript interfaces
├── ReplayRecorder.ts     # Core recording logic
├── ReplayPlayer.ts       # Playback engine
├── ReplayStorage.ts      # Database operations
├── ReplayUI.tsx          # React components (if using React)
├── hooks/                # React hooks
│   ├── useReplay.ts
│   └── useReplayControls.ts
├── utils/                # Helper functions
│   ├── compression.ts
│   └── timing.ts
└── __tests__/            # Tests
    ├── ReplayRecorder.test.ts
    └── ReplayPlayer.test.ts
```

### Database Operations Pattern

```typescript
// src/features/session-replay/ReplayStorage.ts
import { supabase } from '@/db/supabase'

export class ReplayStorage {
  async saveReplay(replay: Replay): Promise<void> {
    const { error } = await supabase
      .from('replays')
      .insert({
        user_id: replay.userId,
        session_id: replay.sessionId,
        events: replay.events,
        metadata: replay.metadata
      })

    if (error) throw new Error(`Failed to save replay: ${error.message}`)
  }

  async getReplay(replayId: string): Promise<Replay | null> {
    const { data, error } = await supabase
      .from('replays')
      .select('*')
      .eq('id', replayId)
      .maybeSingle()

    if (error) throw new Error(`Failed to get replay: ${error.message}`)
    return data ? this.mapToReplay(data) : null
  }

  private mapToReplay(row: any): Replay {
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      events: row.events,
      metadata: row.metadata,
      createdAt: new Date(row.created_at)
    }
  }
}
```

### API Endpoint Pattern

```typescript
// server/routes/replays.ts
import { Router } from 'express'
import { ReplayService } from '../services/ReplayService'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validation'
import { z } from 'zod'

const router = Router()
const replayService = new ReplayService()

// Schema validation
const createReplaySchema = z.object({
  session_id: z.string().uuid(),
  title: z.string().optional()
})

// Create replay
router.post(
  '/replays',
  authenticate,
  validate(createReplaySchema),
  async (req, res) => {
    try {
      const replay = await replayService.create(req.user.id, req.body)
      res.json({ ok: true, replay })
    } catch (error) {
      console.error('Failed to create replay:', error)
      res.status(500).json({ ok: false, error: error.message })
    }
  }
)

// Get replay
router.get('/replays/:id', authenticate, async (req, res) => {
  try {
    const replay = await replayService.get(req.params.id, req.user.id)
    if (!replay) {
      return res.status(404).json({ ok: false, error: 'Replay not found' })
    }
    res.json({ ok: true, replay })
  } catch (error) {
    console.error('Failed to get replay:', error)
    res.status(500).json({ ok: false, error: error.message })
  }
})

export default router
```

---

## Testing Standards

### Unit Test Structure

```typescript
// src/features/session-replay/__tests__/ReplayRecorder.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ReplayRecorder } from '../ReplayRecorder'
import { EventBus } from '@/events/EventBus'

describe('ReplayRecorder', () => {
  let recorder: ReplayRecorder
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
    recorder = new ReplayRecorder(eventBus)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('start()', () => {
    it('should start recording events', async () => {
      const replayId = await recorder.start('session-123')

      expect(replayId).toBeDefined()
      expect(recorder.isRecording()).toBe(true)
    })

    it('should throw if already recording', async () => {
      await recorder.start('session-123')

      await expect(recorder.start('session-123')).rejects.toThrow(
        'Already recording'
      )
    })
  })

  describe('captureEvent()', () => {
    it('should capture events with timing metadata', async () => {
      await recorder.start('session-123')

      const event = { type: 'pre_tool_use', tool: 'Read' }
      recorder.captureEvent(event)

      const events = recorder.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        ...event,
        recorded_at: expect.any(Number),
        relative_time_ms: expect.any(Number)
      })
    })

    it('should not capture when not recording', () => {
      const event = { type: 'pre_tool_use', tool: 'Read' }
      recorder.captureEvent(event)

      expect(recorder.getEvents()).toHaveLength(0)
    })
  })

  describe('compression', () => {
    it('should compress events efficiently', async () => {
      await recorder.start('session-123')

      // Add 100 events
      for (let i = 0; i < 100; i++) {
        recorder.captureEvent({ type: 'pre_tool_use', tool: 'Read' })
      }

      const compressed = recorder.getCompressedEvents()
      const uncompressed = JSON.stringify(recorder.getEvents())

      expect(compressed.length).toBeLessThan(uncompressed.length * 0.5)
    })
  })
})
```

### Integration Test Pattern

```typescript
// test/integration/replay-e2e.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { startServer } from '../helpers/server'
import { createTestUser } from '../helpers/auth'

describe('Replay E2E', () => {
  let server: any
  let user: any
  let baseUrl: string

  beforeAll(async () => {
    server = await startServer()
    baseUrl = `http://localhost:${server.port}`
    user = await createTestUser()
  })

  afterAll(async () => {
    await server.close()
  })

  it('should record, save, and replay a session', async () => {
    // 1. Start recording
    const startRes = await fetch(`${baseUrl}/api/replays/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_id: 'test-session' })
    })
    const { replay_id } = await startRes.json()

    // 2. Simulate some events
    await fetch(`${baseUrl}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'pre_tool_use',
        tool: 'Read',
        session_id: 'test-session'
      })
    })

    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100))

    // 3. Stop recording
    await fetch(`${baseUrl}/api/replays/${replay_id}/stop`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}` }
    })

    // 4. Fetch replay
    const replayRes = await fetch(`${baseUrl}/api/replays/${replay_id}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
    const replay = await replayRes.json()

    expect(replay.events).toHaveLength(1)
    expect(replay.events[0].tool).toBe('Read')
  })
})
```

---

## Performance Optimization Patterns

### Debouncing & Throttling

```typescript
// Debounce expensive operations
import { debounce } from 'lodash-es'

const debouncedAnalyze = debounce(
  (files: string[]) => {
    codeIntelligence.analyze(files)
  },
  2000,
  { leading: false, trailing: true }
)

// Throttle frequent updates
import { throttle } from 'lodash-es'

const throttledUpdateUI = throttle(
  (data: any) => {
    updateVisualization(data)
  },
  16, // 60 FPS
  { leading: true, trailing: true }
)
```

### Memoization

```typescript
import { useMemo } from 'react'

function DependencyGraph({ files }: Props) {
  const graph = useMemo(() => {
    return computeExpensiveGraph(files)
  }, [files])

  return <GraphVisualization data={graph} />
}
```

### Web Workers for Heavy Computation

```typescript
// src/workers/parser.worker.ts
import { Parser } from 'tree-sitter'

self.addEventListener('message', async (event) => {
  const { code, language } = event.data

  const parser = new Parser()
  parser.setLanguage(getLanguage(language))

  const tree = parser.parse(code)
  const symbols = extractSymbols(tree)

  self.postMessage({ symbols })
})

// Usage
const worker = new Worker(new URL('./parser.worker.ts', import.meta.url))

worker.postMessage({ code, language: 'typescript' })
worker.addEventListener('message', (event) => {
  const { symbols } = event.data
  updateSymbolIndex(symbols)
})
```

---

## Security Best Practices

### Input Validation

```typescript
import { z } from 'zod'

// Define schema
const userInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  workspace_id: z.string().uuid()
})

// Validate
function handleInput(input: unknown) {
  const result = userInputSchema.safeParse(input)

  if (!result.success) {
    throw new Error(`Invalid input: ${result.error.message}`)
  }

  return result.data // Typed and validated
}
```

### SQL Injection Prevention

```typescript
// ✅ Good: Use parameterized queries
const { data } = await supabase
  .from('replays')
  .select('*')
  .eq('user_id', userId)  // Safe: automatically parameterized

// ❌ Bad: String concatenation
const query = `SELECT * FROM replays WHERE user_id = '${userId}'`  // NEVER DO THIS
```

### XSS Prevention

```typescript
// ✅ Good: Sanitize HTML content
import DOMPurify from 'dompurify'

function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}

// ✅ Good: Use textContent for plain text
element.textContent = userInput  // Automatically escaped
```

---

## Monitoring & Observability

### Structured Logging

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Usage
logger.info('Replay created', {
  replay_id: replay.id,
  user_id: user.id,
  event_count: replay.events.length
})

logger.error('Failed to save replay', {
  error: error.message,
  stack: error.stack,
  replay_id: replay.id
})
```

### Performance Metrics

```typescript
// Track operation timing
async function trackOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - start

    metrics.histogram('operation_duration_ms', duration, {
      operation,
      status: 'success'
    })

    return result
  } catch (error) {
    const duration = performance.now() - start

    metrics.histogram('operation_duration_ms', duration, {
      operation,
      status: 'error'
    })

    throw error
  }
}

// Usage
await trackOperation('replay.save', () => replayStorage.save(replay))
```

---

## Documentation Standards

### Code Documentation

```typescript
/**
 * Records Claude Code sessions for later replay.
 *
 * @example
 * ```ts
 * const recorder = new ReplayRecorder(eventBus)
 * const replayId = await recorder.start('session-123')
 * // ... events are captured automatically
 * await recorder.stop()
 * ```
 */
export class ReplayRecorder {
  /**
   * Starts recording events for a session.
   *
   * @param sessionId - The Claude session ID to record
   * @param options - Optional recording configuration
   * @returns The unique replay ID
   * @throws {Error} If already recording or session not found
   */
  async start(
    sessionId: string,
    options?: RecordingOptions
  ): Promise<string> {
    // Implementation
  }
}
```

### API Documentation

Use OpenAPI/Swagger spec:

```yaml
openapi: 3.0.0
info:
  title: Vibecraft API
  version: 1.0.0

paths:
  /api/replays:
    post:
      summary: Create a new replay
      tags: [Replays]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                session_id:
                  type: string
                  format: uuid
                title:
                  type: string
      responses:
        '200':
          description: Replay created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Replay'
```

---

## Release Process

### Version Bumping

```bash
# Semantic versioning: MAJOR.MINOR.PATCH

# Patch: bug fixes
npm version patch  # 1.0.0 → 1.0.1

# Minor: new features (backward compatible)
npm version minor  # 1.0.0 → 1.1.0

# Major: breaking changes
npm version major  # 1.0.0 → 2.0.0
```

### Changelog Generation

```markdown
# Changelog

## [1.1.0] - 2026-02-15

### Added
- Session Replay System (VF-001)
  - Record and replay Claude Code sessions
  - VCR-like playback controls
  - Share replay links
  - Export to MP4/WebM
- Code Intelligence Layer (VF-002)
  - Real-time code analysis
  - Dependency graph visualization
  - Complexity heatmap
  - Refactoring suggestions

### Changed
- Improved EventBus performance by 30%
- Updated Three.js to v0.171.0

### Fixed
- Session Replay: Memory leak on long recordings (#123)
- Code Intelligence: TypeScript parser crashes on large files (#145)

### Breaking Changes
None
```

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog generated
- [ ] Version bumped
- [ ] Git tag created
- [ ] npm package published
- [ ] GitHub release created
- [ ] Announcement posted

---

## Continuous Improvement

### Code Review Guidelines

**For Reviewers:**
1. Check spec compliance
2. Verify test coverage (>80%)
3. Review security implications
4. Assess performance impact
5. Validate documentation
6. Ensure consistent style

**For Authors:**
1. Self-review before requesting review
2. Provide context in PR description
3. Link to spec document
4. Highlight key changes
5. Respond to feedback promptly

### Technical Debt Management

Track debt in issues:

```markdown
**Type:** Technical Debt
**Severity:** Medium
**Area:** Session Replay
**Description:**
Event compression is done synchronously, blocking the main thread for
>100ms on large replays.

**Proposed Solution:**
Move compression to Web Worker.

**Estimated Effort:** 1 day
**Impact if not fixed:** Poor UX for users with long sessions
```

---

## Resources

- [Feature Roadmap](./FEATURE_ROADMAP.md)
- [All Specs](../specs/)
- [API Reference](./API.md)
- [Architecture](./ARCHITECTURE.md)
- [Contributing](./CONTRIBUTING.md)

---

*This guide evolves with the project. Suggest improvements via GitHub Issues.*
