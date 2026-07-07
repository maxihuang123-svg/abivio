-- Migration 003: Add anonymous chat logs table
-- Run with: wrangler d1 execute abivio-db --file=./db/migration_003_chat_logs.sql

CREATE TABLE IF NOT EXISTS chat_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_preview TEXT,
  detected_intent TEXT,
  response_source TEXT NOT NULL,
  model TEXT,
  consent_given BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
