/*
  # Session Replay System

  1. New Tables
    - `replays`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `session_id` (text) - Claude session identifier
      - `name` (text) - User-provided name for the replay
      - `description` (text, nullable) - Optional description
      - `duration` (integer) - Duration in milliseconds
      - `event_count` (integer) - Number of events in replay
      - `metadata` (jsonb) - Additional metadata (cwd, flags, stats)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `replay_events`
      - `id` (uuid, primary key)
      - `replay_id` (uuid, foreign key to replays)
      - `timestamp` (timestamptz) - When this event occurred
      - `offset_ms` (integer) - Offset from replay start in milliseconds
      - `type` (text) - Event type (pre_tool_use, post_tool_use, etc.)
      - `tool` (text, nullable) - Tool name if applicable
      - `data` (jsonb) - Full event data
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own replays
    - Replay events are accessible if parent replay is accessible
*/

-- Create replays table
CREATE TABLE IF NOT EXISTS replays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  name text NOT NULL,
  description text,
  duration integer NOT NULL DEFAULT 0,
  event_count integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create replay_events table
CREATE TABLE IF NOT EXISTS replay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  replay_id uuid REFERENCES replays(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz NOT NULL,
  offset_ms integer NOT NULL,
  type text NOT NULL,
  tool text,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_replays_user_id ON replays(user_id);
CREATE INDEX IF NOT EXISTS idx_replays_session_id ON replays(session_id);
CREATE INDEX IF NOT EXISTS idx_replays_created_at ON replays(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replay_events_replay_id ON replay_events(replay_id);
CREATE INDEX IF NOT EXISTS idx_replay_events_offset ON replay_events(offset_ms);

-- Enable RLS
ALTER TABLE replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for replays
CREATE POLICY "Users can view own replays"
  ON replays FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own replays"
  ON replays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replays"
  ON replays FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replays"
  ON replays FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for replay_events
CREATE POLICY "Users can view replay events"
  ON replay_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM replays
      WHERE replays.id = replay_events.replay_id
      AND replays.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create replay events"
  ON replay_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM replays
      WHERE replays.id = replay_events.replay_id
      AND replays.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete replay events"
  ON replay_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM replays
      WHERE replays.id = replay_events.replay_id
      AND replays.user_id = auth.uid()
    )
  );
