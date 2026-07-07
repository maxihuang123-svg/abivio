-- Migration 006: Security — rate-limit tracking & abuse monitoring
-- Run with: wrangler d1 execute abivio-db --file=./db/migration_006_security_rate_limits.sql

-- Tracks per-session and per-IP chat usage per calendar day.
-- Used to enforce daily LLM budgets and detect abuse.
CREATE TABLE IF NOT EXISTS chat_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  llm_count INTEGER DEFAULT 0,
  faq_count INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, ip_hash, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_session_date ON chat_usage(session_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_chat_usage_ip_date ON chat_usage(ip_hash, usage_date);

-- Stores hashed IP + event metadata for abuse monitoring.
-- No raw IP addresses or personal data are stored.
CREATE TABLE IF NOT EXISTS abuse_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT,
  route TEXT,
  event TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_abuse_logs_created ON abuse_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_abuse_logs_ip_hash ON abuse_logs(ip_hash);
