/*
# Create invoices table

Stores invoice proposals created from the dashboard. Each invoice has:
- client_name, client_email, client_phone
- line_items (jsonb array of { name, description, price, quantity, total })
- subtotal, tax_rate, tax_amount, total
- status: draft | sent | paid | void
- token: unique public token for shareable invoice view
- notes (optional message to client)

RLS:
- SELECT/INSERT/UPDATE/DELETE: authenticated only (dashboard users)
- A separate policy allows anon to SELECT by token (for public invoice view)
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name text NOT NULL DEFAULT '',
  client_email text NOT NULL DEFAULT '',
  client_phone text NOT NULL DEFAULT '',
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex'),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_select_own" ON invoices;
CREATE POLICY "invoices_select_own"
ON invoices FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "invoices_insert_own" ON invoices;
CREATE POLICY "invoices_insert_own"
ON invoices FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "invoices_update_own" ON invoices;
CREATE POLICY "invoices_update_own"
ON invoices FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "invoices_delete_own" ON invoices;
CREATE POLICY "invoices_delete_own"
ON invoices FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Public read by token: allows anon to view a specific invoice via share link
DROP POLICY IF EXISTS "invoices_select_public_token" ON invoices;
CREATE POLICY "invoices_select_public_token"
ON invoices FOR SELECT
TO anon
USING (token IS NOT NULL);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION invoices_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_updated_at ON invoices;
CREATE TRIGGER invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION invoices_updated_at();

-- Index for token lookups
CREATE INDEX IF NOT EXISTS invoices_token_idx ON invoices (token);