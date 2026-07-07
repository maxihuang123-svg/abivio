-- Migration: Allow multiple feedback entries per session
-- Run with: wrangler d1 execute DB --file=./db/migration_005_feedback_allow_multiple.sql

-- Drop existing table (no data yet, so safe) and recreate without UNIQUE constraint
DROP TABLE IF EXISTS recommendation_feedback;

CREATE TABLE recommendation_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  helpfulness INTEGER CHECK(helpfulness BETWEEN 1 AND 5),
  found_match TEXT CHECK(found_match IN ('yes', 'somewhat', 'no')),
  nps INTEGER CHECK(nps BETWEEN 0 AND 10),
  missing TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_session ON recommendation_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON recommendation_feedback(created_at);
