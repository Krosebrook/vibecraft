# Vibecraft Documentation Index

**One-stop navigation for all Vibecraft documentation.**

---

## 🚀 Getting Started (5 min)

**New to Vibecraft?** Start here:

1. [README](../README.md) - Project overview and features
2. [Quick Start](QUICKSTART.md) - Install and run in 5 minutes
3. [Setup Guide](SETUP.md) - Detailed installation steps

**Having issues?** → [Troubleshooting Guide](TROUBLESHOOTING.md)

---

## 📖 Core Documentation

### User Guides
| Document | Purpose | Who It's For |
|----------|---------|--------------|
| [Setup Guide](SETUP.md) | Installation and configuration | New users |
| [Orchestration](ORCHESTRATION.md) | Multi-session management | Power users |
| [Sound System](SOUND.md) | Audio and spatial sound | Customizers |
| [Troubleshooting](TROUBLESHOOTING.md) | Fix common problems | Users with issues |

### Developer Guides
| Document | Purpose | Who It's For |
|----------|---------|--------------|
| [Architecture](ARCHITECTURE.md) | System design deep dive | Engineers |
| [API Reference](API.md) | REST & WebSocket API | API consumers |
| [Contributing](CONTRIBUTING.md) | How to contribute | Contributors |
| [Testing Guide](TESTING.md) | Testing strategy | QA, contributors |
| [Implementation Guide](IMPLEMENTATION_GUIDE.md) | Coding standards | Developers |

### Technical Reference
| Document | Purpose | Who It's For |
|----------|---------|--------------|
| [CLAUDE.md](../CLAUDE.md) | Complete technical docs (33KB) | AI assistants |
| [Storage](STORAGE.md) | Data persistence | Backend devs |
| [Design Principles](DESIGN.md) | UX guidelines | Designers |

---

## 🗺️ Roadmaps & Planning

### Product Roadmaps
| Document | Coverage | Timeline |
|----------|----------|----------|
| [MVP Roadmap](MVP_ROADMAP.md) | v0.1.15 → v1.0.0 | 6 months |
| [Feature Roadmap](FEATURE_ROADMAP.md) | v1.0.0 → v2.0.0 | 16-24 months |
| [Specs Index](../specs/README.md) | 20 feature specs | Ongoing |

### Development Planning
| Document | Purpose | Status |
|----------|---------|--------|
| [Implementation Guide](IMPLEMENTATION_GUIDE.md) | Development standards | ✅ Ready |
| [Feature Specs](../specs/) | Detailed specifications | 2/20 complete |
| [Specs Summary](../specs/SPECS_SUMMARY.md) | Quick reference | ✅ Complete |

---

## 📊 By Phase (Current: Phase 1)

### ✅ Phase 0: Foundation (v0.2.0) - COMPLETE
- Testing infrastructure (Vitest)
- CI/CD pipeline (GitHub Actions)
- Database schema (Supabase)
- Code quality (ESLint, Prettier)
- Documentation (18 files, 60k+ words)

**Docs:** All foundational docs complete

---

### 🔄 Phase 1: Core Testing (v0.3.0) - IN PROGRESS
- Unit tests for EventBus, handlers
- Integration tests for API, WebSocket
- Hook script tests
- 80%+ code coverage

**Docs:**
- [Testing Guide](TESTING.md)
- [Contributing Guide](CONTRIBUTING.md)

---

### 📅 Phase 2: Supabase Integration (v0.4.0)
- Authentication flow
- Data sync layer
- Real-time subscriptions
- Migration tools

**Docs:**
- [Storage Guide](STORAGE.md)
- [Architecture](ARCHITECTURE.md)
- Database schema migration files

---

### 📅 Phase 3: Collaboration (v0.5.0)
- Workspace model
- Shared sessions
- Activity feed
- Presence system

**Docs:**
- [Orchestration Guide](ORCHESTRATION.md)
- [Team Spaces Spec](../specs/SPECS_SUMMARY.md#07-team-spaces)

---

### 📅 Phases 4-9 (v0.6.0 → v1.0.0)
See [MVP Roadmap](MVP_ROADMAP.md) for complete phase details.

---

### 📅 Post-v1.0: Intelligence & Enterprise (v1.1.0 → v2.0.0)
See [Feature Roadmap](FEATURE_ROADMAP.md) for 20 additional features:
- Session Replay System
- Code Intelligence Layer
- Real-time Collaboration
- Plugin Marketplace
- Enterprise SSO
- VR/AR Workshop
- And 14 more...

**Docs:**
- [Session Replay Spec](../specs/01-session-replay.md) ✅
- [Code Intelligence Spec](../specs/02-code-intelligence.md) ✅
- [All Specs Summary](../specs/SPECS_SUMMARY.md)

---

## 🎯 By User Type

### For End Users
1. Start: [README](../README.md)
2. Install: [Quick Start](QUICKSTART.md)
3. Learn: [Orchestration](ORCHESTRATION.md)
4. Issues? [Troubleshooting](TROUBLESHOOTING.md)

### For Contributors
1. Setup: [Contributing](CONTRIBUTING.md)
2. Architecture: [Architecture](ARCHITECTURE.md)
3. Code: [Implementation Guide](IMPLEMENTATION_GUIDE.md)
4. Test: [Testing Guide](TESTING.md)
5. Reference: [CLAUDE.md](../CLAUDE.md)

### For Product Managers
1. Vision: [README](../README.md)
2. Current: [MVP Roadmap](MVP_ROADMAP.md)
3. Future: [Feature Roadmap](FEATURE_ROADMAP.md)
4. Specs: [Specs Directory](../specs/)

### For Designers
1. Principles: [Design Guide](DESIGN.md)
2. Sound: [Sound System](SOUND.md)
3. UI Specs: Feature specs in [specs/](../specs/)

---

## 📚 By Topic

### Architecture & Design
- [Architecture](ARCHITECTURE.md) - System design, data flow, patterns
- [Design Principles](DESIGN.md) - UX guidelines, feedback layers
- [Storage](STORAGE.md) - Data persistence strategy
- [API Reference](API.md) - REST & WebSocket protocols

### Development
- [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Coding standards
- [Testing Guide](TESTING.md) - Test strategies and examples
- [Contributing](CONTRIBUTING.md) - Contribution workflow
- [CLAUDE.md](../CLAUDE.md) - Complete technical reference

### Features
- [Orchestration](ORCHESTRATION.md) - Multi-session management
- [Sound System](SOUND.md) - Audio synthesis and spatial audio
- [Feature Roadmap](FEATURE_ROADMAP.md) - Future features
- [Specs Directory](../specs/) - Detailed specifications

### Operations
- [Setup Guide](SETUP.md) - Installation and configuration
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Quick Start](QUICKSTART.md) - TL;DR installation

---

## 📈 Documentation Stats

| Category | Files | Words | Status |
|----------|-------|-------|--------|
| User Guides | 4 | 10k | ✅ Complete |
| Developer Guides | 6 | 35k | ✅ Complete |
| Roadmaps | 2 | 15k | ✅ Complete |
| Feature Specs | 20 | 20k | 10% complete |
| **Total** | **32** | **80k** | **Phase 1 ready** |

---

## 🔍 Search by Keyword

**Authentication:** [Orchestration](ORCHESTRATION.md), [Storage](STORAGE.md), [Enterprise Auth Spec](../specs/SPECS_SUMMARY.md#18-enterprise-sso--rbac)

**Collaboration:** [Orchestration](ORCHESTRATION.md), [Team Spaces Spec](../specs/SPECS_SUMMARY.md#07-team-spaces), [Realtime Collab Spec](../specs/SPECS_SUMMARY.md#05-real-time-collaborative-sessions)

**Database:** [Storage](STORAGE.md), [Architecture](ARCHITECTURE.md), Database schema in Supabase

**Performance:** [Architecture](ARCHITECTURE.md), [Testing](TESTING.md), [Troubleshooting](TROUBLESHOOTING.md)

**Sound:** [Sound System](SOUND.md), [Design Principles](DESIGN.md)

**Testing:** [Testing Guide](TESTING.md), [Contributing](CONTRIBUTING.md), [Implementation Guide](IMPLEMENTATION_GUIDE.md)

**3D Visualization:** [Architecture](ARCHITECTURE.md), [CLAUDE.md](../CLAUDE.md), [VR Spec](../specs/SPECS_SUMMARY.md#13-vrar-workshop)

---

## 🆕 Recently Updated

| Date | Document | Changes |
|------|----------|---------|
| 2026-01-23 | All docs | Initial comprehensive documentation |
| 2026-01-23 | [Implementation Guide](IMPLEMENTATION_GUIDE.md) | New: Development standards |
| 2026-01-23 | [Feature Roadmap](FEATURE_ROADMAP.md) | New: 20-feature roadmap |
| 2026-01-23 | [Specs](../specs/) | New: 2 full specs + 18 summaries |

---

## 📞 Need Help?

1. **Can't find something?** Use Ctrl+F on this page
2. **Doc is unclear?** Open a [GitHub Issue](https://github.com/nearcyan/vibecraft/issues)
3. **Want to contribute?** See [Contributing](CONTRIBUTING.md)
4. **General questions?** [GitHub Discussions](https://github.com/nearcyan/vibecraft/discussions)

---

## 🚀 Quick Actions

**I want to...**

- **Use Vibecraft** → [Quick Start](QUICKSTART.md)
- **Understand how it works** → [Architecture](ARCHITECTURE.md)
- **Contribute code** → [Contributing](CONTRIBUTING.md)
- **Add a feature** → [Feature Roadmap](FEATURE_ROADMAP.md)
- **Fix a bug** → [Troubleshooting](TROUBLESHOOTING.md)
- **Write tests** → [Testing Guide](TESTING.md)
- **Read all the details** → [CLAUDE.md](../CLAUDE.md)

---

*Last updated: January 23, 2026 | Vibecraft v0.2.0*
