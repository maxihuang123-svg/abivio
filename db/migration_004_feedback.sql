-- Migration: Add recommendation feedback table
-- Run with: wrangler d1 execute DB --file=./db/migration_004_feedback.sql

CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  helpfulness INTEGER CHECK(helpfulness BETWEEN 1 AND 5),
  found_match TEXT CHECK(found_match IN ('yes', 'somewhat', 'no')),
  nps INTEGER CHECK(nps BETWEEN 0 AND 10),
  missing TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_session ON recommendation_feedback(session_id);
