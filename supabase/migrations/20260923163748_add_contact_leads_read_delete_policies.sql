-- Allow authenticated (dashboard) users to read and delete contact leads
CREATE POLICY "select_contact_leads" ON contact_leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "delete_contact_leads" ON contact_leads
  FOR DELETE TO authenticated USING (true);