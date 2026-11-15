import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(envUrl && envKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[MRI] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. The site will render, but data features (login, dashboard, forms) are disabled.'
  );
}

// Fall back to placeholder values so createClient never throws and blanks the page.
const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = envKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type QrCode = {
  id: string;
  user_id: string;
  client_name: string;
  label: string;
  content: string;
  fg_color: string;
  bg_color: string;
  size: number;
  created_at: string;
};

export type Sale = {
  id: string;
  user_id: string;
  client_name: string;
  product: string;
  amount: number;
  status: string;
  payment_method: string;
  sale_date: string;
  notes: string;
  created_at: string;
};

export type ContactLead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  created_at: string;
};

export type SiteContentRow = {
  id: string;
  section: string;
  content: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
};

export type SiteContent = Record<string, unknown>;

export async function fetchSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase.from('site_content').select('section, content');
  if (error || !data) return {};
  const result: SiteContent = {};
  for (const row of data as Pick<SiteContentRow, 'section' | 'content'>[]) {
    result[row.section] = row.content ?? {};
  }
  return result;
}

export async function saveSiteContent(section: string, content: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase.from('site_content').upsert(
    { section, content },
    { onConflict: 'section' }
  );
  return !error;
}

export async function uploadSiteImage(file: File, path: string): Promise<string | null> {
  const { error } = await supabase.storage.from('site-images').upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (error) return null;
  return path;
}

export function siteImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  if (!isSupabaseConfigured) return '';
  const base = `${envUrl}/storage/v1/object/public/site-images/`;
  return `${base}${path}`;
}

export type InvoiceLineItem = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
};

export type Invoice = {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'void';
  token: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type InvoiceRow = Omit<Invoice, 'line_items'> & { line_items: unknown };
