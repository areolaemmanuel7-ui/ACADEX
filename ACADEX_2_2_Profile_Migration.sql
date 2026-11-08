-- ACADEX 2.2 — Student Profile System migration
-- Run once in Supabase SQL Editor before deploying the ACADEX 2.2 frontend.
-- Additive only: does not delete tables, rows, policies, or authentication triggers.

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS faculty text,
  ADD COLUMN IF NOT EXISTS campus_location text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}';

-- Keep the timestamp column available for profile edits.
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Verify the expected profile fields after running this migration.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'student_profiles'
ORDER BY ordinal_position;
