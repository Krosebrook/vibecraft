# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

Send vulnerability reports to: **security@vibecraft.sh** (or open a private security advisory on GitHub)

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### What to Expect

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

### Security Update Process

1. We'll acknowledge receipt of your report
2. We'll investigate and confirm the issue
3. We'll develop and test a fix
4. We'll release a security update
5. We'll publicly disclose the vulnerability (with credit to you, if desired)

## Security Considerations

### Local Execution

Vibecraft runs entirely on localhost:
- No remote code execution
- No data sent to external servers (except Deepgram if voice enabled)
- No authentication required (assumes trusted local environment)

### Known Limitations

**tmux Integration:**
- Vibecraft can send commands to tmux sessions
- This is intentional but powerful - protect your tmux sessions
- Use `VIBECRAFT_TMUX_SESSION` to control which session is accessible

**File System Access:**
- Hook scripts write to `~/.vibecraft/data/`
- Server reads/writes files in this directory
- Session spawning can access any directory you have access to

**No Input Validation on Localhost:**
- API endpoints trust localhost clients
- No rate limiting or request size limits (beyond basic DoS protection)
- Assumes you're the only user on localhost

### Best Practices

1. **Don't expose to network:** 
   - Vibecraft is designed for localhost only
   - Don't bind to 0.0.0.0 or public IPs

2. **Protect your tmux sessions:**
   - Don't use `--dangerously-skip-permissions` in production
   - Review prompts before sending to Claude

3. **Review hooks configuration:**
   - Hooks run as your user
   - Check `~/.claude/settings.json` periodically

4. **Keep dependencies updated:**
   - Run `npm audit` regularly
   - Update Node.js and npm

5. **Voice input API key:**
   - Keep `DEEPGRAM_API_KEY` secret
   - Don't commit to version control
   - Use environment variables

## Security Features

### Input Sanitization

- tmux session names validated (alphanumeric + hyphens)
- File paths validated (no directory traversal)
- Request body size limited (1MB max)

### Safe Defaults

- Hooks timeout after 5 seconds
- Events history capped at 1000
- WebSocket messages validated

### No Remote Access

- Server only binds to localhost
- No authentication needed (local trust model)
- No cloud integration (except opt-in Deepgram)

## Vulnerability Disclosure

We follow coordinated disclosure:
1. Private notification to maintainers
2. Fix developed and tested
3. Security update released
4. Public disclosure with credit

Past vulnerabilities will be listed here as they're fixed.

## Dependencies

We use `npm audit` to check for vulnerable dependencies.

Run locally:
```bash
npm audit
npm audit fix  # Apply automatic fixes
```

Critical vulnerabilities are patched immediately.

## Questions?

For security questions (non-vulnerability), open a public issue or discussion.

---

Thank you for helping keep Vibecraft secure!
