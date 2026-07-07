-- D1 Schema for abivio.de MVP

DROP TABLE IF EXISTS chat_logs;
DROP TABLE IF EXISTS waitlist;
DROP TABLE IF EXISTS quiz_answers;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS recommendation_feedback;
DROP TABLE IF EXISTS quiz_sessions;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS universities;

-- German universities (source: Hochschulkompass HRK)
CREATE TABLE universities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hs_number INTEGER,
  short_name TEXT,
  name TEXT NOT NULL,
  address_name TEXT,
  type TEXT,
  ownership TEXT,
  federal_state TEXT,
  student_count INTEGER,
  founded_year INTEGER,
  has_phd_right BOOLEAN DEFAULT 0,
  has_habilitation_right BOOLEAN DEFAULT 0,
  street TEXT,
  zip TEXT,
  city TEXT,
  po_box TEXT,
  po_zip TEXT,
  po_city TEXT,
  phone_prefix TEXT,
  phone TEXT,
  fax TEXT,
  website TEXT,
  is_hrk_member BOOLEAN DEFAULT 0,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
  university_id INTEGER,
  name TEXT NOT NULL,
  field TEXT NOT NULL,
  degree TEXT DEFAULT 'Bachelor',
  duration_semesters INTEGER DEFAULT 6,
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
  application_deadline_winter TEXT,
  application_deadline_summer TEXT,
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

-- Feedback after viewing recommendations
-- Linked to quiz session, strictly anonymous, optional.
CREATE TABLE recommendation_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  helpfulness INTEGER CHECK(helpfulness BETWEEN 1 AND 5),
  found_match TEXT CHECK(found_match IN ('yes', 'somewhat', 'no')),
  nps INTEGER CHECK(nps BETWEEN 0 AND 10),
  missing TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES quiz_sessions(id)
);

-- Anonymous chat logs for improving the chatbot
-- Only stored when the user explicitly consents.
-- No IP address, e-mail, or session identifier is stored.
CREATE TABLE chat_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_preview TEXT,        -- First 120 chars of the question, only if consent given
  detected_intent TEXT,         -- e.g. "nc", "bewerbung", "allgemein"
  response_source TEXT NOT NULL,-- "faq" or "llm"
  model TEXT,                   -- AI model name if LLM was used
  consent_given BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tracks per-session and per-IP chat usage per calendar day.
-- Used to enforce daily LLM budgets and detect abuse.
CREATE TABLE chat_usage (
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

CREATE INDEX idx_chat_usage_session_date ON chat_usage(session_id, usage_date);
CREATE INDEX idx_chat_usage_ip_date ON chat_usage(ip_hash, usage_date);

-- Stores hashed IP + event metadata for abuse monitoring.
-- No raw IP addresses or personal data are stored.
CREATE TABLE abuse_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT,
  route TEXT,
  event TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_abuse_logs_created ON abuse_logs(created_at);
CREATE INDEX idx_abuse_logs_ip_hash ON abuse_logs(ip_hash);
