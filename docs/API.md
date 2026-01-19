# Vibecraft REST API Reference

Complete reference for all HTTP endpoints and WebSocket messages.

## Base URL

```
http://localhost:4003
```

Can be customized via `VIBECRAFT_PORT` environment variable.

## Authentication

Currently no authentication required. All endpoints are public on localhost.

---

## Events

### POST /event

Submit a Claude Code event from hooks.

**Request:**
```json
{
  "type": "pre_tool_use",
  "tool": "Read",
  "toolUseId": "abc123",
  "timestamp": 1705123456789,
  "sessionId": "session-1",
  "input": { "path": "src/main.ts" }
}
```

**Response:**
```json
{
  "ok": true
}
```

---

## Health & Info

### GET /health

Server health check.

**Response:**
```json
{
  "ok": true,
  "version": "0.1.15",
  "clients": 2,
  "events": 123,
  "sessions": 3
}
```

### GET /config

Get server configuration.

**Response:**
```json
{
  "username": "alice",
  "hostname": "macbook",
  "port": 4003,
  "tmuxSession": "claude"
}
```

### GET /info

Get current working directory.

**Response:**
```json
{
  "ok": true,
  "cwd": "/home/user/vibecraft"
}
```

### GET /stats

Get tool usage statistics.

**Response:**
```json
{
  "toolCounts": {
    "Read": 45,
    "Edit": 23,
    "Bash": 12
  },
  "avgDurations": {
    "Read": 125.5,
    "Edit": 89.2,
    "Bash": 1234.7
  },
  "totalEvents": 123,
  "sessions": 3
}
```

---

## Sessions

### GET /sessions

List all managed sessions.

**Response:**
```json
{
  "ok": true,
  "sessions": [
    {
      "id": "managed-1",
      "name": "Frontend",
      "tmuxSession": "vibecraft-a1b2c3d4",
      "status": "idle",
      "createdAt": 1705123456789,
      "lastActivity": 1705123456789,
      "cwd": "/home/user/project",
      "claudeSessionId": "abc123"
    }
  ]
}
```

**Session Status:**
- `idle` - Ready for prompts
- `working` - Executing a tool
- `offline` - tmux session died

### POST /sessions

Create a new managed session.

**Request:**
```json
{
  "name": "Frontend",
  "directory": "/home/user/project",
  "restartClaude": true,
  "useChrome": false,
  "skipPermissions": true
}
```

All fields optional. Defaults:
- `name`: "Claude N" (auto-incrementing)
- `directory`: current working directory
- `restartClaude`: `false`
- `useChrome`: `false`
- `skipPermissions`: `false`

**Response:**
```json
{
  "ok": true,
  "session": {
    "id": "managed-1",
    "name": "Frontend",
    "tmuxSession": "vibecraft-a1b2c3d4",
    "status": "idle",
    "createdAt": 1705123456789,
    "lastActivity": 1705123456789,
    "cwd": "/home/user/project"
  }
}
```

### GET /sessions/:id

Get a specific session.

**Response:**
```json
{
  "ok": true,
  "session": { /* same as POST response */ }
}
```

### PATCH /sessions/:id

Update session name or link to Claude session.

**Request:**
```json
{
  "name": "New Name",
  "linkedClaudeId": "abc123"
}
```

Both fields optional.

**Response:**
```json
{
  "ok": true,
  "session": { /* updated session */ }
}
```

### DELETE /sessions/:id

Delete a session (kills tmux session).

**Response:**
```json
{
  "ok": true
}
```

### POST /sessions/:id/prompt

Send a prompt to a specific session.

**Request:**
```json
{
  "prompt": "Write a test for the login function"
}
```

**Response:**
```json
{
  "ok": true
}
```

### POST /sessions/:id/cancel

Send Ctrl+C to a session (interrupt).

**Response:**
```json
{
  "ok": true
}
```

### GET /sessions/:id/git-status

Get git status for session directory.

**Response:**
```json
{
  "ok": true,
  "status": {
    "branch": "main",
    "ahead": 2,
    "behind": 0,
    "staged": 3,
    "unstaged": 1,
    "untracked": 2,
    "hasChanges": true
  }
}
```

### POST /sessions/:id/restart

Restart an offline session.

**Response:**
```json
{
  "ok": true,
  "session": { /* restarted session */ }
}
```

### POST /sessions/refresh

Manually trigger session health check.

**Response:**
```json
{
  "ok": true
}
```

---

## Prompts (Legacy)

For tmux session specified by `VIBECRAFT_TMUX_SESSION` (default: `claude`).

### POST /prompt

Send a prompt to the default tmux session.

**Request:**
```json
{
  "prompt": "What files are in this directory?",
  "send": true
}
```

- `send: true` - Send immediately to tmux
- `send: false` - Save to pending prompt file

**Response:**
```json
{
  "ok": true,
  "sent": true
}
```

### GET /prompt

Get pending prompt (if saved, not sent).

**Response:**
```json
{
  "prompt": "What files are in this directory?",
  "file": "/home/user/.vibecraft/data/pending-prompt.txt"
}
```

### DELETE /prompt

Clear pending prompt file.

**Response:**
```json
{
  "ok": true
}
```

### POST /cancel

Send Ctrl+C to the default tmux session.

**Response:**
```json
{
  "ok": true
}
```

### GET /tmux-output

Get last 100 lines of tmux output.

**Response:**
```json
{
  "ok": true,
  "output": "... last 100 lines of tmux buffer ...",
  "hasPermissionPrompt": true,
  "permissionContext": {
    "tool": "Bash",
    "context": "rm /tmp/test.txt",
    "options": [
      { "number": 1, "label": "Yes" },
      { "number": 2, "label": "Yes, and always allow..." },
      { "number": 3, "label": "No" }
    ]
  }
}
```

---

## Projects

### GET /projects

List recently used project directories.

**Response:**
```json
{
  "ok": true,
  "projects": [
    "/home/user/project1",
    "/home/user/project2"
  ]
}
```

### GET /projects/autocomplete?q=search

Search project directories for autocomplete.

**Query Parameters:**
- `q` - Search query (directory path prefix)

**Response:**
```json
{
  "ok": true,
  "results": [
    "/home/user/projects/myapp",
    "/home/user/projects/mylib"
  ]
}
```

### DELETE /projects/:path

Remove a project from recent list.

**Path:** URL-encoded project path

**Response:**
```json
{
  "ok": true
}
```

---

## Text Tiles

### GET /tiles

Get all text tiles.

**Response:**
```json
{
  "ok": true,
  "tiles": [
    {
      "id": "uuid-1",
      "text": "My Label",
      "position": { "q": 0, "r": 0 },
      "color": "#22d3ee",
      "createdAt": 1705123456789
    }
  ]
}
```

### POST /tiles

Create a new text tile.

**Request:**
```json
{
  "text": "My Label",
  "position": { "q": 0, "r": 0 },
  "color": "#22d3ee"
}
```

**Response:**
```json
{
  "ok": true,
  "tile": { /* created tile with id */ }
}
```

### PUT /tiles/:id

Update an existing tile.

**Request:**
```json
{
  "text": "Updated Label",
  "color": "#3b82f6"
}
```

**Response:**
```json
{
  "ok": true,
  "tile": { /* updated tile */ }
}
```

### DELETE /tiles/:id

Delete a tile.

**Response:**
```json
{
  "ok": true
}
```

---

## Voice Input

### WebSocket /voice

Real-time speech-to-text transcription using Deepgram.

Requires `DEEPGRAM_API_KEY` environment variable.

**Client → Server (binary):**
- Raw audio data (16-bit PCM, 16kHz, mono)

**Server → Client (JSON):**
```json
{
  "type": "transcript",
  "text": "hello world",
  "isFinal": true
}
```

OR on error:
```json
{
  "type": "error",
  "error": "Deepgram API key not configured"
}
```

---

## WebSocket Messages

Main WebSocket connection at `ws://localhost:4003`.

### Server → Client

#### Event
```json
{
  "type": "event",
  "payload": {
    "type": "pre_tool_use",
    "tool": "Read",
    "toolUseId": "abc123",
    "timestamp": 1705123456789,
    "sessionId": "session-1",
    "input": { "path": "src/main.ts" }
  }
}
```

#### History
```json
{
  "type": "history",
  "payload": [ /* array of events */ ]
}
```

#### Sessions
```json
{
  "type": "sessions",
  "payload": [ /* array of ManagedSession */ ]
}
```

#### Session Update
```json
{
  "type": "session_update",
  "payload": { /* updated ManagedSession */ }
}
```

#### Tokens
```json
{
  "type": "tokens",
  "payload": {
    "session": "vibecraft-a1b2c3d4",
    "current": 1234,
    "cumulative": 5678
  }
}
```

### Client → Server

#### Link Session
```json
{
  "type": "link_session",
  "payload": {
    "managedId": "managed-1",
    "claudeId": "abc123"
  }
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "ok": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found (session/tile doesn't exist)
- `500` - Internal Server Error

---

## Rate Limits

Currently no rate limits enforced.

## CORS

All endpoints allow `*` origin.

## Related Documentation

- [ORCHESTRATION.md](./ORCHESTRATION.md) - Multi-session architecture
- [STORAGE.md](./STORAGE.md) - Data persistence
- [SETUP.md](./SETUP.md) - Server configuration
