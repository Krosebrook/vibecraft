# Vibecraft

![Vibecraft Screenshot](public/og-image.png)

Manage Claude Code in style!

**[Try it instantly at vibecraft.sh](https://vibecraft.sh)** — still connects to your local Claude Code instances!

**New:**
- **Spatial Audio** — Claude behind you? Claude on your left? No claublem!
- **Animations** — What's Claude up to? Watch him! ◕ ‿ ◕

Vibecraft uses your own local Claude Code instances — no files or prompts are shared.

[![npm version](https://img.shields.io/npm/v/vibecraft)](https://www.npmjs.com/package/vibecraft)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Three.js](https://img.shields.io/badge/Three.js-black?logo=threedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=nodedotjs)

## Requirements

- **macOS or Linux** (Windows not supported - hooks require bash)
- **Node.js** 18+
- **jq** - for hook scripts (`brew install jq` / `apt install jq`)
- **tmux** - for session management (`brew install tmux` / `apt install tmux`)

## Quick Start

```bash
# 1. Install dependencies
brew install jq tmux       # macOS
# sudo apt install jq tmux  # Ubuntu/Debian

# 2. Configure hooks (one time)
npx vibecraft setup

# 3. Start server
npx vibecraft
```

Open http://localhost:4003 and use Claude Code normally. You'll see Claude move around the workshop as it uses tools.

**From source:**
```bash
git clone https://github.com/nearcyan/vibecraft
cd vibecraft && npm install && npm run dev
# Opens on http://localhost:4002
```

**To uninstall:** `npx vibecraft uninstall` (removes hooks, keeps your data)

## Browser Control (Optional)

Run Claude in tmux to send prompts from browser:

```bash
tmux new -s claude
claude
```

Then use the input field in the visualization with "Send to tmux" checked.

## Stations

| Station | Tools | Details |
|---------|-------|---------|
| Bookshelf | Read | Books on shelves |
| Desk | Write | Paper, pencil, ink pot |
| Workbench | Edit | Wrench, gears, bolts |
| Terminal | Bash | Glowing screen |
| Scanner | Grep, Glob | Telescope with lens |
| Antenna | WebFetch, WebSearch | Satellite dish |
| Portal | Task (subagents) | Glowing ring portal |
| Taskboard | TodoWrite | Board with sticky notes |

## Features

- **Floating context labels** - See file paths and commands above active stations
- **Thought bubbles** - Claude shows thinking animation while processing
- **Response capture** - Claude's responses appear in the activity feed
- **Subagent visualization** - Mini-Claudes spawn at portal for parallel tasks
- **Cancel button** - Send Ctrl+C to interrupt Claude
- **Split-screen layout** - 60% 3D scene (Workshop), 40% activity feed
- **Voice input** - Speak prompts with real-time transcription (requires Deepgram API key)
- **Attention system** - Zones pulse when sessions need input or finish
- **Sound effects** - Synthesized audio feedback for tools and events ([docs/SOUND.md](docs/SOUND.md))
- **Draw mode** - Paint hex tiles with colors, 3D stacking, and text labels (press `D`)
- **Text labels** - Add multi-line labels to hex tiles with custom modal
- **Zone context menus** - Right-click zones for Info (`I`) or quick Command (`C`) input
- **Station panels** - Toggle with `P` to see recent tool history per workstation
- **Context-aware animations** - Claude celebrates commits, shakes head on errors

## Multi-clauding

![Multi-clauding](public/multiclaude.png)

Run multiple Claude instances and direct work to each:

1. Click **"+ New"** (or `Alt+N`) to spawn a new session
2. Configure name, directory, and flags (`-r`, `--chrome`, `--dangerously-skip-permissions`)
3. Click a session or press `1-6` (or `Alt+1-6` in inputs) to select it
4. Send prompts to whichever Claude you want

Each session runs in its own tmux, with status tracking (idle/working/offline).

See [docs/ORCHESTRATION.md](docs/ORCHESTRATION.md) for the full API and architecture.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `Esc` | Switch focus between Workshop and Feed |
| `1-6` | Switch to session (extended: QWERTY, ASDFGH, ZXCVBN) |
| `0` / `` ` `` | All sessions / overview |
| `Alt+N` | New session |
| `Alt+A` | Go to next session needing attention |
| `Alt+Space` | Expand most recent "show more" in feed |
| `Alt+R` | Toggle voice input |
| `Alt+D` | Toggle dev panel |
| `F` | Toggle follow mode |
| `P` | Toggle station panels |
| `D` | Toggle draw mode |
| `Ctrl+C` | Context-aware: copy or interrupt |

**Draw mode:** `1-6` colors, `0` eraser, `Q/E` brush size, `R` 3D stack, `X` clear

## CLI Options

```bash
vibecraft [options]

Options:
  --port, -p <port>    WebSocket server port (default: 4003)
  --help, -h           Show help
  --version, -v        Show version
```

## Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](docs/QUICKSTART.md) | TL;DR - Get started in 3 commands |
| [Setup Guide](docs/SETUP.md) | Detailed installation and configuration |
| [Orchestration](docs/ORCHESTRATION.md) | Multi-session management |
| [API Reference](docs/API.md) | Complete REST API documentation |
| [Sound System](docs/SOUND.md) | Audio architecture and spatial audio |
| [Storage](docs/STORAGE.md) | Data persistence and localStorage |
| [Design Principles](docs/DESIGN.md) | UI/UX guidelines |
| [Development](docs/DEVELOPMENT.md) | Development environment setup |
| [Contributing](CONTRIBUTING.md) | How to contribute |
| [Technical Docs](CLAUDE.md) | Architecture for AI assistants |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 [Report bugs](https://github.com/nearcyan/vibecraft/issues)
- 💡 [Request features](https://github.com/nearcyan/vibecraft/issues)
- 📖 [Improve docs](https://github.com/nearcyan/vibecraft/pulls)
- 🎨 [Submit PRs](https://github.com/nearcyan/vibecraft/pulls)

## Community

- **Website:** https://vibecraft.sh
- **GitHub:** https://github.com/nearcyan/vibecraft
- **Issues:** https://github.com/nearcyan/vibecraft/issues

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.

## License

[MIT](LICENSE) © 2025 nearcyan
