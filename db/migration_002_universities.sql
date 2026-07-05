-- Migration 002: Add universities table and link programs to universities
-- This migration preserves existing data.

CREATE TABLE IF NOT EXISTS universities (
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

-- Add university_id to programs if not exists
ALTER TABLE programs ADD COLUMN university_id INTEGER REFERENCES universities(id);
