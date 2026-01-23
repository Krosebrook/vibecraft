# Vibecraft Quick Reference Card

One-page cheat sheet for Vibecraft.

## 🚀 Installation (30 seconds)

```bash
brew install jq tmux          # Prerequisites (macOS)
npx vibecraft setup           # Configure hooks
npx vibecraft                 # Start server
# Open http://localhost:4003
```

## ⌨️ Keyboard Shortcuts

| Key | Action | Key | Action |
|-----|--------|-----|--------|
| `Tab` / `Esc` | Switch Workshop ↔ Feed | `1-6` | Select session 1-6 |
| `Alt+N` | New session | `Alt+A` | Next attention |
| `Alt+R` | Voice input | `D` | Draw mode |
| `P` | Station panels | `F` | Follow mode |

## 📁 Project Structure

```
vibecraft/
├── docs/          # Documentation (18 files)
├── specs/         # Feature specs (20 specs)
├── src/           # Frontend (Three.js)
├── server/        # Backend (Node.js)
├── hooks/         # Hook scripts
└── test/          # Tests (Vitest)
```

## 🗺️ Documentation Map

**Start here:** [docs/INDEX.md](INDEX.md)

**Common paths:**
- New user: README → Quick Start → Setup
- Contributor: Contributing → Architecture → Testing
- Product: MVP Roadmap → Feature Roadmap → Specs

## 🔧 Development Commands

```bash
npm run dev          # Start dev servers
npm test             # Run tests
npm run build        # Build for production
npm run lint         # Lint code
npm run format       # Format code
```

## 🗄️ Database Schema

**Supabase tables:**
- `users` - User accounts
- `events` - Event log
- `managed_sessions` - Sessions
- `hex_art` - Painted hexes
- `text_tiles` - Text labels
- `user_preferences` - Settings

**All have RLS enabled.**

## 📊 Current Phase: Phase 1 (v0.2.0)

✅ Testing, CI/CD, database, docs
🔄 Next: Core testing (80% coverage)

**See:** [MVP Roadmap](MVP_ROADMAP.md)

## 🎯 Top 5 Features Coming

1. **Session Replay** (v1.1) - Record/replay sessions
2. **Code Intelligence** (v1.1) - Static analysis
3. **Team Spaces** (v1.3) - Collaboration
4. **Plugin System** (v1.5) - Extensibility
5. **Analytics** (v1.9) - Insights

**See:** [Feature Roadmap](FEATURE_ROADMAP.md)

## 🔗 Important Links

- Website: https://vibecraft.sh
- GitHub: https://github.com/nearcyan/vibecraft
- Issues: https://github.com/nearcyan/vibecraft/issues
- Discussions: https://github.com/nearcyan/vibecraft/discussions

## 💡 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Agent Not Connected" | Run `npx vibecraft` |
| No events | Run `npx vibecraft setup` + restart Claude |
| "jq not found" | `brew install jq` |
| Session offline | Click 🔄 button |

**Full guide:** [Troubleshooting](TROUBLESHOOTING.md)

## 📞 Get Help

1. Check [Troubleshooting](TROUBLESHOOTING.md)
2. Search [Issues](https://github.com/nearcyan/vibecraft/issues)
3. Ask in [Discussions](https://github.com/nearcyan/vibecraft/discussions)

---

*Print this page for quick reference!*
