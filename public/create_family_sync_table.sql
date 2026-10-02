-- Create family_sync table for cross-device data synchronization
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS family_sync (
  family_code TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE family_sync ENABLE ROW LEVEL SECURITY;

-- Allow public access (family code acts as password)
CREATE POLICY "Allow public read access" ON family_sync
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON family_sync
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON family_sync
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON family_sync
  FOR DELETE USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE family_sync;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_family_sync_last_updated ON family_sync(last_updated DESC);
