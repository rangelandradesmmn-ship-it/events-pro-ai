ALTER TABLE guests ADD COLUMN allowed_companions INTEGER DEFAULT 0;
ALTER TABLE guests ADD COLUMN companions_names JSONB DEFAULT '[]'::jsonb;