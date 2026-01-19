# Troubleshooting Guide

Common issues and solutions for Vibecraft.

## Quick Diagnostics

Run these checks first:

```bash
# 1. Check dependencies installed
node --version   # Should be 18+
jq --version     # Should output version
tmux -V          # Should output version

# 2. Check server is running
curl http://localhost:4003/health
# Should return: {"ok":true,...}

# 3. Check hooks configured
cat ~/.claude/settings.json | grep vibecraft
# Should show hook paths

# 4. Check data directory exists
ls -la ~/.vibecraft/data/
# Should show events.jsonl and other files
```

---

## Installation Issues

### "jq: command not found"

**Problem:** Hook script can't find `jq`.

**Solution:**
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt install jq

# Arch Linux
sudo pacman -S jq

# Verify
which jq
jq --version
```

### "Permission denied" on hook script

**Problem:** Hook script isn't executable.

**Solution:**
```bash
chmod +x ~/.vibecraft/hooks/vibecraft-hook.sh

# Or reinstall
npx vibecraft setup
```

### npm/npx not found

**Problem:** Node.js not installed or not in PATH.

**Solution:**
```bash
# Install Node.js 18+
# macOS
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

---

## Connection Issues

### "Agent Not Connected" in browser

**Problem:** Browser can't connect to WebSocket server.

**Possible causes:**

1. **Server not running**
   ```bash
   # Start server
   npx vibecraft
   ```

2. **Wrong port**
   ```bash
   # Check what port server is on
   ps aux | grep vibecraft
   
   # Access correct port
   open http://localhost:4003
   ```

3. **Firewall blocking localhost**
   ```bash
   # Check if port accessible
   curl http://localhost:4003/health
   
   # If fails, check firewall settings
   ```

### WebSocket connection drops

**Problem:** Connection keeps disconnecting.

**Solution:**
- Check server logs for errors
- Restart server: `npx vibecraft`
- Check system resources (RAM, CPU)
- Disable browser extensions that might interfere
- Try different browser

---

## Hook Issues

### Events not appearing

**Problem:** Claude Code tools not showing in visualization.

**Solutions:**

1. **Check hooks configured**
   ```bash
   cat ~/.claude/settings.json | grep -A 2 hooks
   ```
   Should show vibecraft-hook.sh paths.

2. **Restart Claude Code**
   Hooks only load when Claude Code starts.
   ```bash
   # Exit Claude Code, then:
   claude
   ```

3. **Check hook script works**
   ```bash
   echo '{"type":"test"}' | ~/.vibecraft/hooks/vibecraft-hook.sh
   # Should write to events.jsonl and POST to server
   ```

4. **Check events file**
   ```bash
   tail -f ~/.vibecraft/data/events.jsonl
   # Should show new lines when Claude uses tools
   ```

5. **Enable debug mode**
   ```bash
   VIBECRAFT_DEBUG=true npx vibecraft
   # Watch for event broadcasts
   ```

### Events appearing twice

**Problem:** Duplicate events in feed.

**Solution:**
```bash
# Check for duplicate hooks
cat ~/.claude/settings.json

# Look for multiple vibecraft entries
# Remove duplicates, keep only one per hook type

# Or reinstall
npx vibecraft setup
```

### Hook script fails silently

**Problem:** Hook runs but doesn't work.

**Debug steps:**
1. **Test hook manually**
   ```bash
   echo '{"type":"pre_tool_use","tool":"Read","toolUseId":"test"}' | \
     ~/.vibecraft/hooks/vibecraft-hook.sh
   ```

2. **Check PATH in hook**
   Add `echo $PATH >> /tmp/hook-debug.log` to hook script

3. **Check jq works**
   ```bash
   echo '{"test":123}' | jq '.test'
   # Should output: 123
   ```

4. **Check curl works**
   ```bash
   curl -X POST http://localhost:4003/health
   ```

---

## tmux Issues

### "Can't connect to tmux session"

**Problem:** Prompt sending fails.

**Solutions:**

1. **Check session exists**
   ```bash
   tmux list-sessions
   # Should show 'claude' session
   ```

2. **Start tmux session**
   ```bash
   tmux new -s claude
   claude
   ```

3. **Use different session name**
   ```bash
   # If your session is named differently
   VIBECRAFT_TMUX_SESSION=myname npx vibecraft
   ```

4. **Check tmux permissions**
   ```bash
   # Ensure tmux socket is accessible
   ls -la /tmp/tmux-*
   ```

### Prompts not appearing in Claude

**Problem:** Send button doesn't work.

**Solutions:**
1. Check "Send to tmux" is checked
2. Verify tmux session is running
3. Check server logs for errors
4. Try sending manually:
   ```bash
   tmux send-keys -t claude "hello" Enter
   ```

### tmux session offline in UI

**Problem:** Session shows as offline even though it's running.

**Solutions:**
1. Click refresh button in UI
2. Check session name matches:
   ```bash
   tmux list-sessions
   ```
3. Restart session from UI
4. Check server health:
   ```bash
   curl http://localhost:4003/sessions
   ```

---

## Performance Issues

### Low FPS / Laggy visualization

**Solutions:**

1. **Reduce shadow quality**
   - Edit `src/scene/WorkshopScene.ts`
   - Reduce `shadowMapSize` (e.g., 256)
   - Or disable: `renderer.shadowMap.enabled = false`

2. **Limit active sessions**
   - Close unused sessions
   - Keep 3-5 active maximum

3. **Disable sound**
   - Settings modal → uncheck "Sound enabled"

4. **Disable spatial audio**
   - Settings modal → uncheck "Spatial audio"

5. **Close other browser tabs**
   - Three.js needs GPU resources

6. **Check browser performance**
   - Chrome DevTools → Performance tab
   - Look for long frames (>16ms)

### High memory usage

**Solutions:**
1. Clear old events:
   ```bash
   rm ~/.vibecraft/data/events.jsonl
   # Will recreate on next event
   ```

2. Limit history:
   ```bash
   VIBECRAFT_MAX_EVENTS=500 npx vibecraft
   ```

3. Restart browser periodically

4. Close unused sessions

---

## Browser Issues

### Visualization not loading

**Problem:** Blank screen or loading forever.

**Solutions:**

1. **Check browser console**
   - F12 → Console tab
   - Look for errors

2. **Try different browser**
   - Chrome/Edge (Chromium) recommended
   - Firefox should work
   - Safari may have issues

3. **Disable browser extensions**
   - Try incognito/private mode

4. **Clear cache**
   ```
   Ctrl+Shift+Delete → Clear cache
   ```

5. **Check WebGL support**
   - Visit: https://get.webgl.org/
   - Should show spinning cube

### Sound not playing

**Problem:** No audio feedback.

**Solutions:**

1. **Check sound enabled**
   - Settings modal → "Sound enabled" checked

2. **Browser permission**
   - Click anywhere on page first (user gesture required)
   - Check browser didn't block autoplay

3. **Check volume**
   - Settings modal → volume slider
   - System volume

4. **Browser audio**
   - Right-click tab → check "Mute site" not enabled

### Voice input not working

**Problem:** Microphone not recording.

**Solutions:**

1. **Check API key**
   ```bash
   # In .env file or environment
   echo $DEEPGRAM_API_KEY
   ```

2. **Browser permission**
   - Browser should prompt for microphone access
   - Check browser settings if blocked

3. **Check microphone**
   - Test in other apps
   - Check system settings

4. **Server logs**
   ```bash
   # Check for Deepgram errors
   VIBECRAFT_DEBUG=true npx vibecraft
   ```

---

## Build Issues

### TypeScript errors

**Problem:** Build fails with type errors.

**Solutions:**

1. **Clean and rebuild**
   ```bash
   rm -rf dist node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Check TypeScript version**
   ```bash
   npx tsc --version
   # Should be 5.6+
   ```

3. **Check for syntax errors**
   ```bash
   npx tsc --noEmit
   ```

### Vite build fails

**Problem:** Frontend build errors.

**Solutions:**

1. **Clear Vite cache**
   ```bash
   rm -rf node_modules/.vite
   npm run build:client
   ```

2. **Check for import errors**
   - Verify all imports exist
   - Check file paths

3. **Update dependencies**
   ```bash
   npm update
   npm audit fix
   ```

---

## Data Issues

### Lost events/sessions

**Problem:** Data missing after restart.

**Explanation:**
- Events stored in `~/.vibecraft/data/events.jsonl`
- Sessions stored in `~/.vibecraft/data/sessions.json`
- These persist across restarts

**Solutions:**
1. Check files exist:
   ```bash
   ls -la ~/.vibecraft/data/
   ```

2. Check permissions:
   ```bash
   chmod 644 ~/.vibecraft/data/*.json*
   ```

3. Backup data:
   ```bash
   cp -r ~/.vibecraft/data ~/vibecraft-backup
   ```

### Corrupted events file

**Problem:** Server crashes on startup.

**Solutions:**

1. **Backup and reset**
   ```bash
   mv ~/.vibecraft/data/events.jsonl ~/.vibecraft/data/events.jsonl.bak
   # Server will create new file
   ```

2. **Check JSON validity**
   ```bash
   tail ~/.vibecraft/data/events.jsonl | jq '.'
   # Each line should be valid JSON
   ```

---

## Platform-Specific Issues

### macOS

**PATH issues:**
```bash
# Hook script might not find homebrew tools
# Check /opt/homebrew/bin is in PATH
echo $PATH
```

**Solution:** Hook script auto-adds common paths.

**tmux not found:**
```bash
brew install tmux
```

### Linux

**jq not found:**
```bash
sudo apt install jq      # Debian/Ubuntu
sudo pacman -S jq        # Arch
sudo dnf install jq      # Fedora
```

**Node.js too old:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Windows (WSL)

**Windows is not officially supported**, but WSL2 should work:

1. Use WSL2 (not WSL1)
2. Install dependencies in WSL:
   ```bash
   sudo apt install jq tmux nodejs
   ```
3. Run everything inside WSL
4. Access from Windows browser: `http://localhost:4003`

**Known issues:**
- Native Windows not supported (bash required)
- tmux might have permission issues
- Hook PATH might need manual configuration

---

## Getting More Help

### Before asking for help

1. Check this troubleshooting guide
2. Search existing issues: https://github.com/nearcyan/vibecraft/issues
3. Check discussions: https://github.com/nearcyan/vibecraft/discussions
4. Review relevant documentation

### When asking for help

Include:
- Vibecraft version: `npx vibecraft --version`
- Node version: `node --version`
- OS and version
- Error messages (full text)
- Steps to reproduce
- What you've already tried

### Where to ask

- **Bugs:** Open an issue on GitHub
- **Questions:** GitHub Discussions
- **Security:** security@vibecraft.sh (or private advisory)

---

## Still stuck?

Open an issue: https://github.com/nearcyan/vibecraft/issues/new

We're here to help! 🎉
