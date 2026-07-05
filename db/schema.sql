-- D1 Schema for abivio.de MVP

DROP TABLE IF EXISTS waitlist;
DROP TABLE IF EXISTS quiz_sessions;
DROP TABLE IF EXISTS quiz_answers;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS programs;

-- Waitlist entries from landing page
CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  graduation_year INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Curated study programs (MVP seed dataset)
CREATE TABLE programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  field TEXT NOT NULL,
  degree TEXT NOT NULL,
  duration_semesters INTEGER,
  language TEXT DEFAULT 'de',
  nc_required BOOLEAN DEFAULT 0,
  nc_grade REAL,
  description TEXT,
  career TEXT,
  interests TEXT,          -- JSON array of interest tags
  strengths TEXT,            -- JSON array of school-subject tags
  work_style TEXT,           -- JSON array of work-style tags
  tuition_per_semester INTEGER DEFAULT 0,
  is_stem BOOLEAN DEFAULT 0,
  is_business BOOLEAN DEFAULT 0,
  is_social BOOLEAN DEFAULT 0,
  is_creative BOOLEAN DEFAULT 0,
  is_health BOOLEAN DEFAULT 0,
  popularity_rank INTEGER DEFAULT 999,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quiz sessions
CREATE TABLE quiz_sessions (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Individual quiz answers
CREATE TABLE quiz_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_key TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id)
);

-- Computed recommendations per session
CREATE TABLE recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  program_id INTEGER NOT NULL,
  score REAL NOT NULL,
  reasoning TEXT,
  rank INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id),
  FOREIGN KEY (program_id) REFERENCES programs(id)
);
