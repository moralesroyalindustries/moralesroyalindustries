/*
# Create sales table for private sales dashboard

1. New Tables
- `sales`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user via auth.uid())
  - `client_name` (text, name of the client the sale is for)
  - `product` (text, what was sold — product or service name)
  - `amount` (numeric, dollar amount of the sale)
  - `status` (text, sale status: 'pending', 'completed', 'refunded' — defaults to 'completed')
  - `payment_method` (text, how the client paid — e.g. 'cash', 'card', 'stripe', 'transfer' — defaults to '')
  - `sale_date` (date, when the sale was made — defaults to today)
  - `notes` (text, optional notes about the sale — defaults to '')
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `sales`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- Four separate policies (select/insert/update/delete), all scoped TO authenticated with auth.uid() = user_id.
- user_id has DEFAULT auth.uid() so frontend inserts that omit user_id still satisfy WITH CHECK.

3. Indexes
- Index on user_id for fast per-user queries.
- Index on sale_date for date-range queries.
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL DEFAULT '',
  product text NOT NULL DEFAULT '',
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  payment_method text NOT NULL DEFAULT '',
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);

DROP POLICY IF EXISTS "select_own_sales" ON sales;
CREATE POLICY "select_own_sales"
ON sales FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sales" ON sales;
CREATE POLICY "insert_own_sales"
ON sales FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sales" ON sales;
CREATE POLICY "update_own_sales"
ON sales FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sales" ON sales;
CREATE POLICY "delete_own_sales"
ON sales FOR DELETE
TO authenticated USING (auth.uid() = user_id);
