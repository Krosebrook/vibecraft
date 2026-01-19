# Changelog

All notable changes to Vibecraft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.15] - 2025-01-19

### Added
- Hosted instance at vibecraft.sh
- Comprehensive documentation suite
  - API.md - Complete REST API reference
  - CONTRIBUTING.md - Contribution guidelines
  - DEVELOPMENT.md - Development guide
  - SECURITY.md - Security policy
  - CHANGELOG.md - Version history
- CODE_OF_CONDUCT.md - Community guidelines
- Cross-references between documentation files

### Changed
- Improved documentation organization
- Updated README with better structure

## [0.1.x] - Previous Releases

### Features Implemented

#### Core Visualization
- 3D workshop with hexagonal zones
- Character movement to stations based on tool usage
- World hex grid overlay
- Honeycomb zone layout with spiral positioning
- 9 stations per zone (bookshelf, desk, workbench, terminal, scanner, antenna, portal, taskboard)
- Context labels above stations (file paths, commands)
- Thought bubbles for thinking state

#### Multi-Session Orchestration
- Multiple Claude Code instances management
- Session creation, deletion, restart
- Status tracking (idle, working, offline)
- Session health monitoring
- Auto-linking between managed sessions and Claude instances
- Zone labels with session names
- Keyboard shortcuts for session switching (1-6, QWERTY, etc.)

#### Character System
- ClaudeMon animated robot character
- Idle animations (fidget, dance, emote)
- Working animations per station
- State machine (idle, walking, working, thinking)
- Color-coded status ring
- Context-aware animations (victory dance on git commit, etc.)
- Random idle behavior on zone focus

#### Audio System
- Synthesized sound effects using Tone.js
- Tool-specific sounds (8 tools)
- State sounds (success, error, walking)
- Event sounds (prompt, stop, thinking, notification)
- Special sounds (git_commit fanfare, intro jazz chord)
- Spatial audio with distance-based volume
- Stereo panning based on zone position
- Focus boost for selected zones
- Settings toggle for sound and spatial audio

#### UI Components
- Activity feed with session filtering
- Timeline strip with tool icons
- Prompt input with auto-expand
- Voice input with Deepgram integration
- Session panel with status indicators
- Settings modal
- Question modal (AskUserQuestion tool)
- Permission modal (tool permissions)
- Zone info modal (git status, tokens, files)
- Zone command modal (quick prompt input)
- Toast notifications
- Station panels (recent tool history)
- Draw mode (hex painting with colors, 3D stacking)
- Text label modal (multi-line labels)
- Dev panel for testing animations

#### Event System
- EventBus architecture with modular handlers
- 6 focused handler modules
  - soundHandlers - Audio feedback
  - characterHandlers - Movement, animations
  - zoneHandlers - Status, attention
  - notificationHandlers - Floating text
  - subagentHandlers - Task spawning
  - feedHandlers - Feed updates
- 8 hook types supported (PreToolUse, PostToolUse, Stop, SubagentStop, SessionStart, SessionEnd, UserPromptSubmit, Notification)

#### Storage & Persistence
- localStorage for user preferences (volume, keybinds, hex art)
- Server files for shared state (sessions, tiles, events)
- Session persistence across restarts
- Text tile persistence
- Event log (events.jsonl)

#### tmux Integration
- Browser-to-Claude prompt sending
- Cancel button (Ctrl+C)
- Output polling for token tracking
- Permission prompt detection
- Multi-session support

#### Subagent Visualization
- Mini-Claudes spawn at portal for Task tool
- Color-coded subagents
- Fan positioning to avoid overlap
- Spawn/despawn animations

#### Attention System
- Zones pulse when needing attention
- Attention queue for questions
- Alt+A to go to next attention item
- Zone floor status colors

#### Keyboard Shortcuts
- Tab/Esc - Switch focus between Workshop and Feed
- 1-6, QWERTY, ASDFGH, ZXCVBN - Session switching
- Alt+N - New session
- Alt+A - Next attention
- Alt+Space - Expand most recent "show more"
- Alt+R - Toggle voice input
- Alt+D - Toggle dev panel
- F - Toggle follow mode
- P - Toggle station panels
- D - Toggle draw mode
- Ctrl+C - Context-aware (copy or interrupt)

#### Performance Optimizations
- BasicShadowMap instead of PCFSoftShadowMap
- 512x512 shadow maps (reduced from 2048)
- Single hemisphere light
- Antialiasing disabled
- Merged geometries for hex grid
- Object pooling for notifications

#### API Endpoints
- `/event` - Receive hooks
- `/health` - Server status
- `/config` - Configuration
- `/stats` - Tool statistics
- `/prompt` - Send prompts (legacy)
- `/cancel` - Send Ctrl+C
- `/info` - Server info
- `/sessions` - CRUD operations
- `/sessions/:id/prompt` - Send to session
- `/sessions/:id/cancel` - Interrupt session
- `/sessions/:id/git-status` - Git status
- `/sessions/:id/restart` - Restart offline
- `/sessions/refresh` - Health check
- `/projects` - Recent projects
- `/tiles` - Text tile CRUD
- `/tmux-output` - Tmux buffer
- WebSocket for real-time events

### Bug Fixes
- Octal timestamp parsing in hook script
- Multi-line JSON breaking JSONL format
- MCP tool movement overwriting real movements
- History showing pending icons for completed tools
- tmux Enter key inserting newlines
- State machine preventing idle during walking
- Permission modal escape/click-outside close
- Timeline icon duplication on reconnect

### Documentation
- CLAUDE.md - Comprehensive technical documentation
- README.md - Overview and quick start
- docs/SETUP.md - Installation guide
- docs/QUICKSTART.md - TL;DR version
- docs/ORCHESTRATION.md - Multi-session API
- docs/SOUND.md - Audio system
- docs/STORAGE.md - Data persistence
- docs/DESIGN.md - Design principles

## Roadmap

### Planned Features
- [ ] Session replay - Replay events from history
- [ ] File system map - 3D visualization of touched files
- [ ] VR support - WebXR for immersive view
- [ ] Templates - Pre-configured session types
- [ ] Workflows - Chain prompts across sessions
- [ ] Auto-scaling - Spawn sessions based on workload
- [ ] Session groups - Organize related sessions

### Under Consideration
- Automated testing
- Plugin system
- Multi-user collaboration
- Custom themes
- Mobile support

---

## Version History

[0.1.15]: https://github.com/nearcyan/vibecraft/releases/tag/v0.1.15
