/*
# Create qr_codes table for private QR generator dashboard

1. New Tables
- `qr_codes`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user via auth.uid())
  - `client_name` (text, name of the client the QR is for)
  - `label` (text, optional short label/title for the QR code)
  - `content` (text, the URL or text encoded into the QR code)
  - `fg_color` (text, foreground color hex, defaults to '#0a0f1c')
  - `bg_color` (text, background color hex, defaults to '#ffffff')
  - `size` (integer, pixel size of the QR, defaults to 512)
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `qr_codes`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- Four separate policies (select/insert/update/delete), all scoped TO authenticated with auth.uid() = user_id.
- user_id has DEFAULT auth.uid() so frontend inserts that omit user_id still satisfy WITH CHECK.

3. Indexes
- Index on user_id for fast per-user queries.
*/

CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  content text NOT NULL,
  fg_color text NOT NULL DEFAULT '#0a0f1c',
  bg_color text NOT NULL DEFAULT '#ffffff',
  size integer NOT NULL DEFAULT 512,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);

DROP POLICY IF EXISTS "select_own_qr_codes" ON qr_codes;
CREATE POLICY "select_own_qr_codes"
ON qr_codes FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_qr_codes" ON qr_codes;
CREATE POLICY "insert_own_qr_codes"
ON qr_codes FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_qr_codes" ON qr_codes;
CREATE POLICY "update_own_qr_codes"
ON qr_codes FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_qr_codes" ON qr_codes;
CREATE POLICY "delete_own_qr_codes"
ON qr_codes FOR DELETE
TO authenticated USING (auth.uid() = user_id);
