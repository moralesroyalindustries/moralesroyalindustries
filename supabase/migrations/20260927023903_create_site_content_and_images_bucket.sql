/*
# Create site content table and site images storage bucket

1. New Tables
- `site_content` — stores editable text fields for the public website.
  - `id` (uuid, primary key, default gen_random_uuid())
  - `section` (text, unique, not null) — identifies which part of the site this row controls (e.g. 'hero', 'join', 'contact').
  - `content` (jsonb, not null, default '{}') — flexible key/value text pairs for the section.
  - `updated_at` (timestamptz, default now())
  - `updated_by` (uuid, nullable, references auth.users) — who last edited.
- Only one row per section (unique constraint on `section`).

2. New Storage Bucket
- `site-images` — a private bucket for website images uploaded from the dashboard.
  - Allowed mime types: png, jpeg, webp, gif.
  - Max file size: 4 MB.

3. Security
- Enable RLS on `site_content`.
- SELECT: anyone (anon + authenticated) can read — the public site needs to load content without a session.
- INSERT / UPDATE / DELETE: only authenticated users (the dashboard editor).
- Storage policies on `storage.objects` for `site-images`:
  - SELECT: public (anon) so the website can display images.
  - INSERT / UPDATE / DELETE: authenticated only (dashboard editor).

4. Notes
- The public website reads `site_content` and image URLs from storage; nothing on the public site changes until a dashboard user saves an edit.
- Images are served via public bucket URLs (read-only public), but only signed-in users can upload or replace them.
*/

CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text UNIQUE NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_select_all" ON site_content;
CREATE POLICY "site_content_select_all"
ON site_content FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_content_insert_own" ON site_content;
CREATE POLICY "site_content_insert_own"
ON site_content FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "site_content_update_own" ON site_content;
CREATE POLICY "site_content_update_own"
ON site_content FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "site_content_delete_own" ON site_content;
CREATE POLICY "site_content_delete_own"
ON site_content FOR DELETE
TO authenticated USING (true);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_site_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
BEFORE UPDATE ON site_content
FOR EACH ROW
EXECUTE FUNCTION set_site_content_updated_at();

-- Storage bucket for website images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  4194304,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "site_images_read_public" ON storage.objects;
CREATE POLICY "site_images_read_public"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_insert_auth" ON storage.objects;
CREATE POLICY "site_images_insert_auth"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_update_auth" ON storage.objects;
CREATE POLICY "site_images_update_auth"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-images')
WITH CHECK (bucket_id = 'site-images');

DROP POLICY IF EXISTS "site_images_delete_auth" ON storage.objects;
CREATE POLICY "site_images_delete_auth"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-images');