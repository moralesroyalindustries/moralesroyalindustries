/*
# Fix search_path on site_content trigger function

The security advisor flagged that `set_site_content_updated_at()` has a mutable
search_path, which could allow a caller-controlled search_path to shadow
referenced objects. This migration sets `search_path = public` on the function
to close that gap. No data changes, no policy changes.
*/

CREATE OR REPLACE FUNCTION set_site_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;