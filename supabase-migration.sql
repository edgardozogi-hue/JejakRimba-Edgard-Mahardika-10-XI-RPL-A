-- Migration: Profile enhancement + avatars storage
-- Paste ENTIRE file into Supabase Dashboard > SQL Editor, then Run.
-- Idempotent: safe to run multiple times.

-- 1) Profile columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='notification_prefs') THEN
    ALTER TABLE profiles ADD COLUMN notification_prefs jsonb DEFAULT '{"booking": true, "reminder": true, "promo": false}'::jsonb;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='deleted_at') THEN
    ALTER TABLE profiles ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='password_changed_at') THEN
    ALTER TABLE profiles ADD COLUMN password_changed_at timestamptz;
  END IF;
END $$;

-- 2) Index + backfill default prefs
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;
UPDATE profiles
SET notification_prefs = '{"booking": true, "reminder": true, "promo": false}'::jsonb
WHERE notification_prefs IS NULL;

-- 3) avatars bucket (idempotent; public so URLs load without auth)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 4) Storage RLS policies.
-- NOTE: AvatarUpload.tsx uploads to path `avatars/<file>` (no user folder),
-- so policies grant any authenticated user access to the `avatars` folder.
DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
CREATE POLICY "avatar_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatar_auth_insert" ON storage.objects;
CREATE POLICY "avatar_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "avatar_auth_update" ON storage.objects;
CREATE POLICY "avatar_auth_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "avatar_auth_delete" ON storage.objects;
CREATE POLICY "avatar_auth_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');