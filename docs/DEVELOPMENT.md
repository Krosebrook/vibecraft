# Development Guide

Comprehensive guide for developers working on Vibecraft.

## Development Environment

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | 8+ | Package manager |
| jq | 1.6+ | JSON processing in hooks |
| tmux | 3.0+ | Session management |
| Claude Code | Latest | Testing |

### Optional Tools

- **VS Code** - Recommended IDE with TypeScript support
- **Chrome DevTools** - For debugging Three.js performance
- **Git** - Version control

## Initial Setup

```bash
# Clone repository
git clone https://github.com/nearcyan/vibecraft
cd vibecraft

# Install dependencies
npm install

# Configure hooks (creates ~/.vibecraft/ directories)
npx vibecraft setup

# Start development servers
npm run dev
```

## Architecture Deep Dive

### Frontend (src/)

**Entry Point:** `src/main.ts`
- Initializes Three.js scene
- Sets up WebSocket client
- Registers event handlers
- Manages UI state

**Scene Management:** `src/scene/WorkshopScene.ts`
- Creates 3D world with hex grid
- Manages zones (hexagonal platforms)
- Positions stations within zones
- Handles camera, lighting, rendering

**Event System:** `src/events/`
- `EventBus.ts` - Central event dispatcher
- `handlers/` - Modular event handlers (6 files)
  - `soundHandlers.ts` - Audio feedback
  - `characterHandlers.ts` - Movement, animations
  - `zoneHandlers.ts` - Zone status, attention
  - `notificationHandlers.ts` - Floating text
  - `subagentHandlers.ts` - Task tool spawning
  - `feedHandlers.ts` - Activity feed updates

**Character System:** `src/entities/`
- `ClaudeMon.ts` - Main animated character
- `IdleBehaviors.ts` - Random idle animations
- `WorkingBehaviors.ts` - Station-specific animations
- `SubagentManager.ts` - Mini-Claude spawning

**Audio:** `src/audio/`
- `SoundManager.ts` - Tone.js synthesis, playback
- `SpatialAudioContext.ts` - 3D positioning

**UI Components:** `src/ui/`
- `FeedManager.ts` - Activity feed
- `QuestionModal.ts` - Ask user questions
- `PermissionModal.ts` - Tool permissions
- `DrawMode.ts` - Hex painting
- `TextLabelModal.ts` - Multi-line text input

### Backend (server/)

**Main Server:** `server/index.ts`
- HTTP server with routing
- WebSocket server for real-time events
- Session management (tmux orchestration)
- File watching (events.jsonl)
- Token polling from tmux output
- Git status tracking
- Voice input proxy (Deepgram)

### Shared (shared/)

**Types:** `shared/types.ts`
- All TypeScript interfaces
- `ClaudeEvent` union type
- `TOOL_STATION_MAP` - Tool to station mapping
- WebSocket message types

**Configuration:** `shared/defaults.ts`
- Default port, paths, settings
- Single source of truth for defaults

### Hooks (hooks/)

**Hook Script:** `hooks/vibecraft-hook.sh`
- Bash script receiving stdin from Claude Code
- Transforms events with `jq`
- Writes to `~/.vibecraft/data/events.jsonl`
- POSTs to server for real-time updates
- Cross-platform PATH handling

## Development Workflow

### Running Locally

Two modes:

**Development Mode** (hot reload):
```bash
npm run dev
# Frontend: http://localhost:4002
# Backend: http://localhost:4003
```

**Production Mode** (compiled):
```bash
npm run build
npx vibecraft
# Both on: http://localhost:4003
```

### File Watching

In dev mode:
- `vite` watches frontend files → hot reload
- `tsx watch` watches server files → auto-restart

No need to manually restart unless changing:
- `package.json`
- `tsconfig.json`
- Environment variables

### Testing Changes

1. **Start servers:**
   ```bash
   npm run dev
   ```

2. **Run Claude in tmux:**
   ```bash
   tmux new -s claude
   claude
   ```

3. **Open browser:**
   ```
   http://localhost:4002
   ```

4. **Use Claude Code:**
   - Give Claude a task
   - Watch visualization update
   - Check browser console for errors
   - Monitor server logs

### Debugging

**Frontend:**
- Chrome DevTools → Console
- Three.js Inspector: `scene.getObjectByName('...')`
- Stats panel: `Alt+D` for dev panel

**Backend:**
- Server logs: `DEBUG=true npm run dev:server`
- Check files: `cat ~/.vibecraft/data/events.jsonl`
- WebSocket: Browser Network tab → WS

**Hooks:**
- Manually run: `echo '{}' | ~/.vibecraft/hooks/vibecraft-hook.sh`
- Check PATH: Add `echo $PATH` to hook script
- Verify jq: `which jq`

## Common Development Tasks

### Adding a New Tool Mapping

**Goal:** Make a new Claude Code tool appear at a specific station.

**Steps:**

1. **Edit `shared/types.ts`:**
   ```typescript
   export const TOOL_STATION_MAP: Record<string, StationType> = {
     // ... existing
     MyNewTool: 'bookshelf',  // or create new station
   }
   ```

2. **If creating new station, edit `src/scene/WorkshopScene.ts`:**
   ```typescript
   // Add to STATION_POSITIONS
   const STATION_POSITIONS: Record<StationType, Vector3> = {
     // ... existing
     mystation: new Vector3(-2, 0, 2),
   }

   // Add to StationType in shared/types.ts
   export type StationType = 'center' | 'bookshelf' | ... | 'mystation'

   // Create mesh in createStations()
   private createStations(): void {
     // ... existing
     const mystationMesh = createMystationStation()
     this.stations.set('mystation', mystationMesh)
   }
   ```

3. **Create station file `src/scene/stations/MystationStation.ts`:**
   ```typescript
   import * as THREE from 'three'

   export function createMystationStation(): THREE.Group {
     const group = new THREE.Group()
     // ... create station 3D objects
     return group
   }
   ```

4. **Test:**
   - Restart dev server
   - Use Claude Code with that tool
   - Verify character moves to new station

### Adding a New Animation

**Goal:** Add a new idle animation for Claude.

**Steps:**

1. **Edit `src/entities/IdleBehaviors.ts`:**
   ```typescript
   const myAnimation: IdleBehavior = {
     name: 'myAnimation',
     duration: 2,           // seconds
     weight: 5,             // selection probability
     categories: ['idle', 'emote'],
     update: (parts, progress, deltaTime) => {
       // Animate parts based on progress (0→1)
       parts.head.rotation.y = Math.sin(progress * Math.PI * 2) * 0.2
     },
     reset: (parts) => {
       // ALWAYS reset to default pose
       parts.head.rotation.y = 0
     }
   }

   export const IDLE_BEHAVIORS: IdleBehavior[] = [
     // ... existing
     myAnimation,
   ]
   ```

2. **Test:**
   - Reload browser
   - Press `Alt+D` for dev panel
   - Click "Play Animation" → select your animation
   - Verify it plays and resets correctly

### Adding a New Sound Effect

**Goal:** Add a synthesized sound for an event.

**Steps:**

1. **Edit `src/audio/SoundManager.ts`:**
   ```typescript
   // Add to SoundName type
   export type SoundName = ... | 'my_sound'

   // Add spatial mode
   const SOUND_SPATIAL_MODE: Record<SoundName, SpatialMode> = {
     ...
     my_sound: 'positional',  // or 'global'
   }

   // Add sound definition
   private sounds: Record<SoundName, () => void> = {
     ...
     my_sound: () => {
       const synth = this.createDisposableSynth(
         { type: 'sine', attack: 0.01, decay: 0.1 },
         VOL.NORMAL
       )
       synth.triggerAttackRelease('C5', '8n')
     },
   }
   ```

2. **Call from event handler:**
   ```typescript
   // In src/events/handlers/soundHandlers.ts
   eventBus.on('my_event', (event, ctx) => {
     if (!ctx.soundEnabled) return
     soundManager.play('my_sound', { zoneId: ctx.session?.id })
   })
   ```

3. **Test:**
   - Reload browser
   - Trigger the event
   - Verify sound plays

### Adding a New API Endpoint

**Goal:** Add a new HTTP endpoint to the server.

**Steps:**

1. **Edit `server/index.ts`:**
   ```typescript
   // Add route handler
   if (req.method === 'GET' && req.url === '/my-endpoint') {
     res.writeHead(200, { 'Content-Type': 'application/json' })
     res.end(JSON.stringify({ ok: true, data: 'hello' }))
     return
   }
   ```

2. **Add types (if needed) in `shared/types.ts`:**
   ```typescript
   export interface MyRequest {
     field: string
   }
   ```

3. **Create client API in `src/api/`:**
   ```typescript
   export async function getMyData(): Promise<MyResponse> {
     const res = await fetch('/my-endpoint')
     return res.json()
   }
   ```

4. **Document in `docs/API.md`**

5. **Test:**
   ```bash
   curl http://localhost:4003/my-endpoint
   ```

## Build System

### TypeScript Compilation

**Frontend:** Compiled by Vite
- Config: `tsconfig.json`
- Output: `dist/`
- Includes: bundling, minification, tree-shaking

**Backend:** Compiled by `tsc`
- Config: `tsconfig.server.json`
- Output: `dist/server/`
- Preserves ES modules

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `concurrently ...` | Run both dev servers |
| `dev:client` | `vite` | Frontend dev server |
| `dev:server` | `tsx watch server/index.ts` | Backend dev server |
| `build` | `npm run build:client && build:server` | Build both |
| `build:client` | `tsc && vite build` | Build frontend |
| `build:server` | `tsc -p tsconfig.server.json` | Build backend |
| `server` | `tsx server/index.ts` | Run backend only |

### Publishing

Handled by `prepublishOnly` script:
```bash
npm version patch  # or minor, major
npm publish
```

This automatically:
1. Runs `build:server`
2. Publishes to npm with built files

Users then run:
```bash
npx vibecraft setup
npx vibecraft
```

## Performance Optimization

### Frontend

**Rendering:**
- Target: 60 FPS with 5+ active sessions
- Use `BasicShadowMap` (not `PCFSoftShadowMap`)
- Limit shadow map size (512x512)
- Merge static geometries
- Use instancing for repeated objects

**Memory:**
- Dispose of geometries/materials when removing objects
- Use object pooling for particles
- Limit event history (1000 events default)
- Clear old notifications

**Tips:**
- Profile with Chrome DevTools Performance tab
- Check FPS drop with Stats.js
- Use `renderer.info` for draw calls
- Reduce polygon count on stations

### Backend

**File Watching:**
- Use chokidar (optimized for performance)
- Debounce rapid events
- Limit history size

**WebSocket:**
- Broadcast efficiently (one message to many clients)
- Use binary for large data
- Throttle high-frequency updates

**Session Health:**
- Check every 5s (not too frequent)
- Batch tmux queries
- Cache git status (1s TTL)

## Troubleshooting

### "Cannot find module" errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hooks not firing

1. Check `~/.claude/settings.json` has hooks configured
2. Verify hook script exists: `ls -la ~/.vibecraft/hooks/`
3. Check permissions: `chmod +x ~/.vibecraft/hooks/vibecraft-hook.sh`
4. Restart Claude Code (hooks load at startup)
5. Check hook can run: `echo '{}' | ~/.vibecraft/hooks/vibecraft-hook.sh`

### Frontend not updating

1. Check browser console for errors
2. Verify WebSocket connected (Network tab)
3. Check server is running: `curl http://localhost:4003/health`
4. Look at server logs for broadcast messages

### Build failures

```bash
# Check TypeScript errors
npx tsc --noEmit

# Check server TypeScript
npx tsc -p tsconfig.server.json --noEmit

# Clean build artifacts
rm -rf dist
npm run build
```

## Code Patterns

### Event Handler Pattern

```typescript
// Register handlers
eventBus.on('event_type', (event: EventType, ctx: EventContext) => {
  if (!ctx.session) return  // Skip if no session context
  // Handle event...
})
```

### Async/Await in UI

```typescript
async function doSomething() {
  try {
    const result = await fetch('/api/endpoint')
    const data = await result.json()
    // Update UI
  } catch (error) {
    console.error('Failed:', error)
    // Show error to user
  }
}
```

### Three.js Cleanup

```typescript
function removeObject(obj: THREE.Object3D) {
  scene.remove(obj)
  
  // Recursively dispose
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose())
      } else {
        child.material.dispose()
      }
    }
  })
}
```

## Resources

- [Three.js Docs](https://threejs.org/docs/)
- [Tone.js Docs](https://tonejs.github.io/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Guide](https://vitejs.dev/guide/)

## Getting Help

- Open an issue on GitHub
- Check existing issues for similar problems
- Ask in Discussions tab
- Review CLAUDE.md for architecture details

---

Happy coding! 🚀
