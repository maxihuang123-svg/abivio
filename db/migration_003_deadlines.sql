-- Add application deadline columns to programs table
ALTER TABLE programs ADD COLUMN application_deadline_winter TEXT;
ALTER TABLE programs ADD COLUMN application_deadline_summer TEXT;
