# Contributing to Vibecraft

Thank you for your interest in contributing to Vibecraft! This document provides guidelines and information to help you contribute effectively.

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to build something cool together.

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **jq** (`brew install jq` / `apt install jq`)
- **tmux** (`brew install tmux` / `apt install tmux`)
- **Claude Code** CLI installed

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vibecraft
   cd vibecraft
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run setup (configures hooks):**
   ```bash
   npx vibecraft setup
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```
   This runs:
   - Vite dev server on http://localhost:4002 (frontend)
   - WebSocket API server on http://localhost:4003 (backend)

5. **Test with Claude Code:**
   ```bash
   tmux new -s claude
   claude
   ```

   Open http://localhost:4002 in your browser.

For more details, see [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).

## Project Structure

```
vibecraft/
├── src/               # Frontend (Three.js, TypeScript)
│   ├── main.ts        # Entry point
│   ├── scene/         # 3D scene, zones, stations
│   ├── entities/      # Characters, animations
│   ├── events/        # EventBus, handlers
│   ├── ui/            # Modals, panels, forms
│   ├── audio/         # Sound manager, spatial audio
│   └── styles/        # Modular CSS
├── server/            # Backend (Node.js, WebSocket)
│   └── index.ts       # Main server file
├── shared/            # Shared types, constants
│   ├── types.ts       # TypeScript types
│   └── defaults.ts    # Configuration defaults
├── hooks/             # Bash hook scripts
│   └── vibecraft-hook.sh
├── docs/              # Documentation
└── bin/               # CLI entry point
```

## Development Workflow

### 1. Pick an Issue

Check the [Issues](https://github.com/nearcyan/vibecraft/issues) page for:
- `good first issue` - Great for newcomers
- `help wanted` - Community input needed
- `bug` - Something's broken
- `enhancement` - New feature ideas

### 2. Create a Branch

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Lint (if applicable)
npm run lint

# Build
npm run build

# Test manually with Claude Code
npm run dev
# ... use Claude Code and verify changes ...
```

### 5. Commit

Use clear, descriptive commit messages:

```bash
git commit -m "Add spatial audio for zone events"
git commit -m "Fix: Claude character stuck when moving between zones"
git commit -m "Docs: Update API.md with new /tiles endpoints"
```

**Commit message prefixes:**
- `Add:` - New feature
- `Fix:` - Bug fix
- `Docs:` - Documentation only
- `Refactor:` - Code restructuring
- `Style:` - Formatting, CSS changes
- `Test:` - Add or update tests
- `Chore:` - Build, dependencies, tooling

### 6. Push and Create PR

```bash
git push origin feature/my-new-feature
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Description explaining what and why
- Screenshots/videos if UI changes
- Reference related issues (`Fixes #123`)

## What to Contribute

### Ideas for Contributions

**Easy:**
- Fix typos in documentation
- Improve error messages
- Add keyboard shortcuts
- New idle animations for Claude
- New sound effects
- Color scheme tweaks

**Medium:**
- New station types
- Improved UI components
- Performance optimizations
- Better mobile support
- Additional tool mappings

**Advanced:**
- VR/WebXR support
- File system visualization
- Session replay feature
- Multi-user collaboration
- Plugin system

### Areas We Need Help

- **Testing:** Cross-platform testing (Linux, macOS)
- **Documentation:** Tutorials, videos, examples
- **UI/UX:** Design improvements, accessibility
- **Performance:** Optimization for large sessions
- **Sound:** New audio effects, music themes

## Code Style

### TypeScript

- Use `const` over `let` when possible
- Prefer type inference over explicit types (when clear)
- Use descriptive variable names
- Add JSDoc comments for public APIs

```typescript
// Good
const station = scene.getStation('bookshelf')
const position = calculateHexPosition(q, r)

// Avoid
let x = scene.getStation('bookshelf')
const p = calculateHexPosition(q, r)
```

### CSS

- Use CSS modules or scoped styles
- Follow existing naming conventions
- Group related properties
- Use CSS custom properties for themes

### Three.js

- Dispose of geometries and materials when removing objects
- Use object pooling for frequently created/destroyed objects
- Prefer merged geometries for static objects
- Keep render loop efficient (avoid heavy calculations)

## Adding New Features

### New Tool Mapping

1. Add tool to `TOOL_STATION_MAP` in `shared/types.ts`
2. If new station needed, create in `src/scene/stations/`
3. Add position to `STATION_POSITIONS` in `WorkshopScene.ts`
4. Add station to scene in `createStations()`
5. Test with Claude Code

### New Animation

1. Define animation in `src/entities/IdleBehaviors.ts` or `WorkingBehaviors.ts`
2. Add to registry
3. Test with dev panel (`Alt+D`)

### New Sound Effect

1. Add sound name to `SoundName` type in `SoundManager.ts`
2. Add spatial mode to `SOUND_SPATIAL_MODE`
3. Implement sound definition
4. Call from event handler
5. Document in `docs/SOUND.md`

### New API Endpoint

1. Add handler in `server/index.ts`
2. Update types in `shared/types.ts` if needed
3. Document in `docs/API.md`
4. Update client code in `src/api/`

## Documentation

When adding features, update:
- `README.md` - If user-facing feature
- `CLAUDE.md` - If architectural change
- `docs/API.md` - If new endpoint
- Relevant doc in `docs/` - If related to specific area

## Testing

Currently no automated tests (contributions welcome!).

Test manually:
1. Start dev servers (`npm run dev`)
2. Run Claude Code in tmux
3. Verify your changes work as expected
4. Test edge cases
5. Check browser console for errors

## Performance

Keep Vibecraft fast:
- Profile with Chrome DevTools
- Check FPS with stats panel
- Test with multiple sessions
- Watch memory usage
- Optimize hot paths

## Getting Help

- **Discord:** (coming soon)
- **GitHub Discussions:** Ask questions, share ideas
- **Issues:** Report bugs, request features

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Document** new features
6. **Submit** pull request
7. **Respond** to review feedback
8. **Merge** when approved

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run `npm run build`
4. Test built version
5. Commit: `git commit -m "Release v0.1.X"`
6. Tag: `git tag v0.1.X`
7. Push: `git push && git push --tags`
8. Publish: `npm publish`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or reach out to the maintainers. We're happy to help!

---

**Thank you for contributing to Vibecraft!** 🎉
