import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowRight, Download, LogOut, Plus, Search, Trash2, QrCode as QrIcon, ExternalLink, TrendingUp, DollarSign, ShoppingBag, Calendar, Mail, Phone, MessageSquare, Inbox, FileText, Image as ImageIcon, Save, Upload, RotateCcw, Receipt, Send, Copy, Check, X as XIcon, Minus } from 'lucide-react';
import { supabase, type QrCode as QrCodeRow, type Sale, type ContactLead, fetchSiteContent, saveSiteContent, uploadSiteImage, siteImageUrl, type SiteContent, type Invoice, type InvoiceLineItem } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { copy, deepMerge, type Language } from '@/App';

type Tab = 'qr' | 'sales' | 'leads' | 'editor' | 'invoices';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('qr');

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-left">
          <a className="brand" href="/">
            <img src="/images/MRI_NET_LOGO.png" alt="MRI" />
          </a>
          <div className="dash-title">
            <h1>Dashboard</h1>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="button button-ghost dash-logout" onClick={() => signOut()}>
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <div className="dash-tabs">
        <button className={`dash-tab ${tab === 'qr' ? 'active' : ''}`} onClick={() => setTab('qr')}>
          <QrIcon size={16} /> QR Codes
        </button>
        <button className={`dash-tab ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}>
          <TrendingUp size={16} /> Sales
        </button>
        <button className={`dash-tab ${tab === 'leads' ? 'active' : ''}`} onClick={() => setTab('leads')}>
          <Inbox size={16} /> Leads
        </button>
        <button className={`dash-tab ${tab === 'editor' ? 'active' : ''}`} onClick={() => setTab('editor')}>
          <FileText size={16} /> Website
        </button>
        <button className={`dash-tab ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>
          <Receipt size={16} /> Invoices
        </button>
      </div>

      {tab === 'qr' && <QrPanel />}
      {tab === 'sales' && <SalesPanel />}
      {tab === 'leads' && <LeadsPanel />}
      {tab === 'editor' && <WebsiteEditor />}
      {tab === 'invoices' && <InvoicesPanel />}
    </div>
  );
}

/* ===== QR Panel ===== */

function QrPanel() {
  const [codes, setCodes] = useState<QrCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [clientName, setClientName] = useState('');
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [fgColor, setFgColor] = useState('#0a0f1c');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(512);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const previewRef = useRef<HTMLCanvasElement>(null);

  const drawPreview = useCallback(async () => {
    if (!previewRef.current || !content) return;
    try {
      await QRCode.toCanvas(previewRef.current, content || ' ', {
        width: 200,
        margin: 1,
        color: { dark: fgColor, light: bgColor },
      });
    } catch {
      // ignore — invalid input
    }
  }, [content, fgColor, bgColor]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCodes(data as QrCodeRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!content.trim()) {
      setFormError('Please enter a URL or text to encode.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('qr_codes').insert({
      client_name: clientName,
      label: label,
      content: content,
      fg_color: fgColor,
      bg_color: bgColor,
      size: size,
    });
    setSaving(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    setClientName('');
    setLabel('');
    setContent('');
    setFgColor('#0a0f1c');
    setBgColor('#ffffff');
    setSize(512);
    fetchCodes();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('qr_codes').delete().eq('id', id);
    if (!error) setCodes(codes.filter((c) => c.id !== id));
  };

  const handleDownload = async (code: QrCodeRow) => {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, code.content, {
      width: code.size,
      margin: 2,
      color: { dark: code.fg_color, light: code.bg_color },
    });
    const link = document.createElement('a');
    link.download = `qr-${code.client_name || code.label || 'code'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const filtered = codes.filter((c) => {
    const q = search.toLowerCase();
    return c.client_name.toLowerCase().includes(q) || c.label.toLowerCase().includes(q) || c.content.toLowerCase().includes(q);
  });

  return (
    <div className="dash-grid">
      <section className="dash-panel generator-panel">
        <div className="panel-head">
          <h2><Plus size={18} /> New QR Code</h2>
          <p>Unlimited generation — runs in your browser.</p>
        </div>

        <form className="generator-form" onSubmit={handleSave}>
          <div className="form-row">
            <label>
              <span>Client name</span>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Acme Corp" />
            </label>
            <label>
              <span>Label (optional)</span>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Menu QR" />
            </label>
          </div>

          <label>
            <span>URL or text to encode</span>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="https://example.com" />
          </label>

          <div className="form-row form-row-tight">
            <label className="color-field">
              <span>Foreground</span>
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
            </label>
            <label className="color-field">
              <span>Background</span>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </label>
            <label className="size-field">
              <span>Download size: {size}px</span>
              <input type="range" min={128} max={1024} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </label>
          </div>

          <div className="preview-area">
            <canvas ref={previewRef} />
            <span className="preview-hint">{content ? 'Live preview' : 'Type to see preview'}</span>
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <button type="submit" className="button button-primary" disabled={saving || !content.trim()}>
            {saving ? 'Saving…' : 'Save QR code'} <ArrowRight size={16} />
          </button>
        </form>
      </section>

      <section className="dash-panel history-panel">
        <div className="panel-head">
          <h2><QrIcon size={18} /> Saved codes</h2>
          <div className="search-box">
            <Search size={15} />
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <QrIcon size={40} strokeWidth={1} />
            <p>{codes.length === 0 ? 'No QR codes yet. Create your first one.' : 'No results match your search.'}</p>
          </div>
        ) : (
          <div className="qr-list">
            {filtered.map((code) => (
              <div className="qr-item" key={code.id}>
                <div className="qr-thumb" style={{ background: code.bg_color }}>
                  <QrThumb code={code} />
                </div>
                <div className="qr-info">
                  <h3>{code.client_name || 'Untitled client'}</h3>
                  {code.label && <span className="qr-label">{code.label}</span>}
                  <a className="qr-content" href={code.content.startsWith('http') ? code.content : undefined} target="_blank" rel="noreferrer">
                    {code.content} {code.content.startsWith('http') && <ExternalLink size={11} />}
                  </a>
                  <span className="qr-date">{new Date(code.created_at).toLocaleDateString()}</span>
                </div>
                <div className="qr-actions">
                  <button onClick={() => handleDownload(code)} aria-label="Download"><Download size={16} /></button>
                  <button onClick={() => handleDelete(code.id)} aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QrThumb({ code }: { code: QrCodeRow }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, code.content, {
      width: 56,
      margin: 0,
      color: { dark: code.fg_color, light: code.bg_color },
    }).catch(() => {});
  }, [code]);

  return <canvas ref={ref} />;
}

/* ===== Sales Panel ===== */

const STATUS_OPTIONS = ['pending', 'completed', 'refunded'] as const;
const PAYMENT_OPTIONS = ['cash', 'card', 'stripe', 'transfer', 'other'] as const;

function SalesPanel() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [clientName, setClientName] = useState('');
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<string>('completed');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false });
    if (!error && data) setSales(data as Sale[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!clientName.trim() && !product.trim()) {
      setFormError('Please enter at least a client name or product.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setFormError('Please enter a valid amount.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('sales').insert({
      client_name: clientName,
      product: product,
      amount: parsedAmount,
      status: status,
      payment_method: paymentMethod,
      sale_date: saleDate,
      notes: notes,
    });
    setSaving(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    setClientName('');
    setProduct('');
    setAmount('');
    setStatus('completed');
    setPaymentMethod('');
    setSaleDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    fetchSales();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (!error) setSales(sales.filter((s) => s.id !== id));
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('sales').update({ status: newStatus }).eq('id', id);
    if (!error) setSales(sales.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
  };

  const filtered = sales.filter((s) => {
    const q = search.toLowerCase();
    return s.client_name.toLowerCase().includes(q) || s.product.toLowerCase().includes(q) || s.status.toLowerCase().includes(q);
  });

  const totalRevenue = sales.filter((s) => s.status === 'completed').reduce((sum, s) => sum + Number(s.amount), 0);
  const pendingRevenue = sales.filter((s) => s.status === 'pending').reduce((sum, s) => sum + Number(s.amount), 0);
  const totalSales = sales.length;

  const formatCurrency = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <>
      <div className="sales-stats">
        <div className="sales-stat-card">
          <span className="sales-stat-icon revenue"><DollarSign size={20} /></span>
          <div>
            <strong>{formatCurrency(totalRevenue)}</strong>
            <span>Total revenue</span>
          </div>
        </div>
        <div className="sales-stat-card">
          <span className="sales-stat-icon pending"><Calendar size={20} /></span>
          <div>
            <strong>{formatCurrency(pendingRevenue)}</strong>
            <span>Pending</span>
          </div>
        </div>
        <div className="sales-stat-card">
          <span className="sales-stat-icon count"><ShoppingBag size={20} /></span>
          <div>
            <strong>{totalSales}</strong>
            <span>Total sales</span>
          </div>
        </div>
      </div>

      <div className="dash-grid dash-grid-sales">
        <section className="dash-panel generator-panel">
          <div className="panel-head">
            <h2><Plus size={18} /> Log a Sale</h2>
            <p>Record a new transaction.</p>
          </div>

          <form className="generator-form" onSubmit={handleSave}>
            <div className="form-row">
              <label>
                <span>Client name</span>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Acme Corp" />
              </label>
              <label>
                <span>Product / service</span>
                <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Website Essentials" />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Amount ($)</span>
                <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </label>
              <label>
                <span>Sale date</span>
                <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </label>
              <label>
                <span>Payment method</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="">— Select —</option>
                  {PAYMENT_OPTIONS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </label>
            </div>

            <label>
              <span>Notes (optional)</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any details about this sale…" rows={3} />
            </label>

            {formError && <p className="form-error">{formError}</p>}

            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add sale'} <ArrowRight size={16} />
            </button>
          </form>
        </section>

        <section className="dash-panel history-panel">
          <div className="panel-head">
            <h2><TrendingUp size={18} /> Sales history</h2>
            <div className="search-box">
              <Search size={15} />
              <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={40} strokeWidth={1} />
              <p>{sales.length === 0 ? 'No sales yet. Log your first one.' : 'No results match your search.'}</p>
            </div>
          ) : (
            <div className="sales-list">
              <div className="sales-row sales-row-header">
                <span>Client</span>
                <span>Product</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Date</span>
                <span></span>
              </div>
              {filtered.map((sale) => (
                <div className="sales-row" key={sale.id}>
                  <span className="sales-cell-client">{sale.client_name || '—'}</span>
                  <span className="sales-cell-product">{sale.product || '—'}</span>
                  <span className="sales-cell-amount">{formatCurrency(Number(sale.amount))}</span>
                  <span>
                    <select
                      className={`status-select status-${sale.status}`}
                      value={sale.status}
                      onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </span>
                  <span className="sales-cell-date">{new Date(sale.sale_date).toLocaleDateString()}</span>
                  <button className="sales-delete" onClick={() => handleDelete(sale.id)} aria-label="Delete sale">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

/* ===== Leads Panel ===== */

function LeadsPanel() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLeads(data as ContactLead[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('contact_leads').delete().eq('id', id);
    if (!error) setLeads(leads.filter((l) => l.id !== id));
  };

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.note.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <>
      <div className="sales-stats">
        <div className="sales-stat-card">
          <span className="sales-stat-icon count"><Inbox size={20} /></span>
          <div>
            <strong>{leads.length}</strong>
            <span>Total leads</span>
          </div>
        </div>
        <div className="sales-stat-card">
          <span className="sales-stat-icon revenue"><Mail size={20} /></span>
          <div>
            <strong>{new Set(leads.map((l) => l.email)).size}</strong>
            <span>Unique contacts</span>
          </div>
        </div>
        <div className="sales-stat-card">
          <span className="sales-stat-icon pending"><Calendar size={20} /></span>
          <div>
            <strong>{leads.filter((l) => {
              const diff = Date.now() - new Date(l.created_at).getTime();
              return diff < 7 * 24 * 60 * 60 * 1000;
            }).length}</strong>
            <span>This week</span>
          </div>
        </div>
      </div>

      <section className="dash-panel history-panel leads-panel-full">
        <div className="panel-head">
          <h2><Inbox size={18} /> Client leads</h2>
          <div className="search-box">
            <Search size={15} />
            <input type="text" placeholder="Search by name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Inbox size={40} strokeWidth={1} />
            <p>{leads.length === 0 ? 'No leads yet. Form submissions will appear here.' : 'No results match your search.'}</p>
          </div>
        ) : (
          <div className="leads-list">
            {filtered.map((lead) => (
              <div className="lead-card" key={lead.id}>
                <div className="lead-card-header">
                  <div className="lead-avatar">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="lead-card-info">
                    <h3>{lead.name}</h3>
                    <span className="lead-date">{formatDate(lead.created_at)}</span>
                  </div>
                  <button className="sales-delete" onClick={() => handleDelete(lead.id)} aria-label="Delete lead">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="lead-card-details">
                  <a className="lead-detail-item" href={`mailto:${lead.email}`}>
                    <Mail size={14} /> {lead.email}
                  </a>
                  <a className="lead-detail-item" href={`tel:${lead.phone}`}>
                    <Phone size={14} /> {lead.phone}
                  </a>
                </div>
                <div className="lead-card-note">
                  <MessageSquare size={14} />
                  <p>{lead.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/* ===== Website Editor Panel ===== */

type EditorSection = {
  key: string;
  label: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' }[];
  images: { key: string; label: string; path: string }[];
};

const EDITOR_SECTIONS: EditorSection[] = [
  {
    key: 'hero',
    label: 'Hero section',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow text', type: 'text' },
      { key: 'title', label: 'Main heading', type: 'text' },
      { key: 'accent', label: 'Accent (gold text)', type: 'text' },
      { key: 'body', label: 'Description', type: 'textarea' },
      { key: 'primary', label: 'Primary button', type: 'text' },
      { key: 'secondary', label: 'Secondary button', type: 'text' },
      { key: 'note', label: 'Footnote', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'solutions',
    label: 'Solutions section',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow text', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Description', type: 'textarea' },
    ],
    images: [],
  },
  {
    key: 'aria',
    label: 'Aria Assist section',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow text', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Description', type: 'textarea' },
      { key: 'cta', label: 'Button text', type: 'text' },
      { key: 'tag', label: 'Tag line', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'process',
    label: 'Process section',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow text', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Description', type: 'textarea' },
    ],
    images: [],
  },
  {
    key: 'join',
    label: 'Partner / Join section',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow text', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Description', type: 'textarea' },
      { key: 'pitch', label: 'Pitch line', type: 'textarea' },
      { key: 'cta', label: 'Button text', type: 'text' },
      { key: 'note', label: 'Button note', type: 'text' },
    ],
    images: [
      { key: 'step1_image', label: 'Step 01 image', path: 'join/step1.png' },
      { key: 'step2_image', label: 'Step 02 image', path: 'join/step2.png' },
      { key: 'step3_image', label: 'Step 03 image', path: 'join/step3.png' },
      { key: 'step4_image', label: 'Step 04 image', path: 'join/step4.png' },
    ],
  },
  {
    key: 'contact',
    label: 'Contact section',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow text', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Description', type: 'textarea' },
      { key: 'cta', label: 'Button text', type: 'text' },
      { key: 'small', label: 'Small note', type: 'text' },
    ],
    images: [],
  },
  {
    key: 'form',
    label: 'Lead form section',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow text', type: 'text' },
      { key: 'title', label: 'Heading', type: 'text' },
      { key: 'body', label: 'Description', type: 'textarea' },
      { key: 'submit', label: 'Submit button', type: 'text' },
    ],
    images: [],
  },
];

function WebsiteEditor() {
  const [lang, setLang] = useState<Language>('en');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<Record<string, Record<string, unknown>>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteContent().then((data) => {
      setContent(data);
      setDraft(JSON.parse(JSON.stringify(data)));
    }).catch(() => {
      setContent({});
      setDraft({});
    });
  }, []);

  const baseCopy = copy[lang];
  const liveDraft = draft[lang] ?? {};

  const getValue = (section: string, fieldKey: string): string => {
    const sectionData = liveDraft[section];
    if (sectionData && typeof sectionData === 'object' && fieldKey in sectionData) {
      return String((sectionData as Record<string, unknown>)[fieldKey] ?? '');
    }
    const base = (baseCopy as unknown as Record<string, Record<string, unknown>>)[section];
    if (base && typeof base === 'object') {
      return String(base[fieldKey] ?? '');
    }
    return '';
  };

  const setImageValue = (section: string, imageKey: string): string => {
    const sectionData = liveDraft[section];
    if (sectionData && typeof sectionData === 'object' && imageKey in sectionData) {
      return String((sectionData as Record<string, unknown>)[imageKey] ?? '');
    }
    return '';
  };

  const setValue = (section: string, fieldKey: string, value: string) => {
    setDraft((prev) => {
      const langDraft = { ...(prev[lang] ?? {}) };
      const sectionData = { ...((langDraft[section] as Record<string, unknown>) ?? {}) };
      sectionData[fieldKey] = value;
      langDraft[section] = sectionData;
      return { ...prev, [lang]: langDraft };
    });
    setSaveStatus('idle');
  };

  const handleImageUpload = async (section: string, imageKey: string, path: string, file: File) => {
    setUploadError(null);
    setUploading(imageKey);
    try {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file (PNG, JPG, WebP, or GIF).');
        setUploading(null);
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setUploadError('Image must be 4 MB or smaller.');
        setUploading(null);
        return;
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fullPath = `${path.replace(/\.\w+$/, '')}.${ext}`;
      const uploaded = await uploadSiteImage(file, fullPath);
      if (!uploaded) {
        setUploadError('Upload failed. Please try again.');
        setUploading(null);
        return;
      }
      const url = siteImageUrl(uploaded);
      setDraft((prev) => {
        const langDraft = { ...(prev[lang] ?? {}) };
        const sectionData = { ...((langDraft[section] as Record<string, unknown>) ?? {}) };
        sectionData[imageKey] = url;
        langDraft[section] = sectionData;
        return { ...prev, [lang]: langDraft };
      });
      setSaveStatus('idle');
    } catch {
      setUploadError('Upload failed. Please try again.');
    }
    setUploading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    let allOk = true;
    for (const section of EDITOR_SECTIONS) {
      const sectionData = (draft[lang] ?? {})[section.key];
      if (sectionData && typeof sectionData === 'object' && Object.keys(sectionData).length > 0) {
        const ok = await saveSiteContent(`${lang}_${section.key}`, sectionData as Record<string, unknown>);
        if (!ok) allOk = false;
      }
    }
    setSaving(false);
    setSaveStatus(allOk ? 'saved' : 'error');
    if (allOk) {
      setContent(JSON.parse(JSON.stringify(draft)));
    }
  };

  const handleReset = () => {
    setDraft(JSON.parse(JSON.stringify(content ?? {})));
    setSaveStatus('idle');
    setUploadError(null);
  };

  if (content === null) {
    return <p className="empty-state">Loading editor…</p>;
  }

  const section = EDITOR_SECTIONS[activeSection];

  return (
    <div className="editor-layout">
      <section className="dash-panel editor-sidebar">
        <div className="panel-head">
          <h2><FileText size={18} /> Website editor</h2>
          <p>Edit your live site text and images.</p>
        </div>
        <div className="editor-lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
          <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>Español</button>
        </div>
        <div className="editor-section-list">
          {EDITOR_SECTIONS.map((s, i) => (
            <button
              key={s.key}
              className={`editor-section-item ${i === activeSection ? 'active' : ''}`}
              onClick={() => setActiveSection(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="editor-actions">
          <button className="button button-ghost" onClick={handleReset} disabled={saving}>
            <RotateCcw size={15} /> Revert
          </button>
          <button className="button button-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : <><Save size={15} /> Save changes</>}
          </button>
        </div>
        {saveStatus === 'saved' && <p className="editor-status success">Saved — your site is updated.</p>}
        {saveStatus === 'error' && <p className="editor-status error">Could not save. Please try again.</p>}
      </section>

      <section className="dash-panel editor-main">
        <div className="panel-head">
          <h3>{section.label}</h3>
          <span className="editor-lang-badge">{lang === 'en' ? 'English' : 'Español'}</span>
        </div>

        <div className="editor-fields">
          {section.fields.map((field) => (
            <label key={field.key} className="editor-field">
              <span>{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  value={getValue(section.key, field.key)}
                  onChange={(e) => setValue(section.key, field.key, e.target.value)}
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  value={getValue(section.key, field.key)}
                  onChange={(e) => setValue(section.key, field.key, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>

        {section.images.length > 0 && (
          <div className="editor-images">
            <div className="editor-images-title"><ImageIcon size={16} /> Images</div>
            <div className="editor-image-grid">
              {section.images.map((img) => {
                const url = setImageValue(section.key, img.key);
                const originalBase = (baseCopy as unknown as Record<string, Record<string, unknown>>)[section.key];
                const originalUrl = originalBase && img.key in originalBase ? String(originalBase[img.key]) : '';
                const displayUrl = url || originalUrl;
                return (
                  <div className="editor-image-card" key={img.key}>
                    <div className="editor-image-preview">
                      {displayUrl ? (
                        <img src={displayUrl} alt={img.label} />
                      ) : (
                        <span className="editor-image-placeholder"><ImageIcon size={28} /></span>
                      )}
                    </div>
                    <span className="editor-image-label">{img.label}</span>
                    <label className="editor-image-upload">
                      <Upload size={14} />
                      <span>{uploading === img.key ? 'Uploading…' : 'Replace'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(section.key, img.key, img.path, file);
                          e.target.value = '';
                        }}
                        disabled={uploading !== null}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
            {uploadError && <p className="form-error">{uploadError}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

/* ===== Invoices Panel ===== */

type CatalogItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

const CATALOG: CatalogItem[] = [
  { id: 'website-essentials', name: 'Website Essentials', description: 'Mobile-first web display, up to 10 images, Google Reviews, contact and location.', price: 347 },
  { id: 'website-advanced', name: 'Website Advanced System', description: 'Advanced maps, video loops, conversion system, contact forms, basic SEO.', price: 597 },
  { id: 'ultimate-web', name: 'Ultimate Web System', description: 'E-commerce + payments, CRM, weekly optimization, AI-powered calls. 12-month agreement.', price: 4995 },
  { id: 'nfc-card', name: 'Google Reviews NFC Card', description: 'Smart NFC card that collects more customer reviews with a tap.', price: 39 },
  { id: 'coaching-call', name: 'Coaching Call', description: '30–40 minute coaching call to discuss workflows and platform questions.', price: 99 },
  { id: 'custom', name: 'Custom item', description: 'Add a custom product or service with your own pricing.', price: 0 },
];

const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'status-pending',
  sent: 'status-completed',
  paid: 'status-completed',
  void: 'status-refunded',
};

function InvoicesPanel() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<{ name: string; email: string; url: string } | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setInvoices(data as unknown as Invoice[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxRateNum = parseFloat(taxRate) || 0;
  const taxAmount = (subtotal * taxRateNum) / 100;
  const total = subtotal + taxAmount;

  const addCatalogItem = (item: CatalogItem) => {
    if (item.id === 'custom') {
      setLineItems((prev) => [
        ...prev,
        { name: '', description: '', price: 0, quantity: 1, total: 0 },
      ]);
    } else {
      setLineItems((prev) => [
        ...prev,
        { name: item.name, description: item.description, price: item.price, quantity: 1, total: item.price },
      ]);
    }
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'price' || field === 'quantity') {
          updated.total = Number(updated.price) * Number(updated.quantity);
        }
        return updated;
      })
    );
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setLineItems([]);
    setTaxRate('0');
    setNotes('');
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent, sendNow: boolean) => {
    e.preventDefault();
    setFormError(null);
    if (!clientName.trim()) {
      setFormError('Please enter a client name.');
      return;
    }
    if (!clientEmail.trim()) {
      setFormError('Please enter a client email.');
      return;
    }
    if (lineItems.length === 0) {
      setFormError('Add at least one product or service to the invoice.');
      return;
    }
    const hasInvalid = lineItems.some((item) => !item.name.trim() || item.price < 0 || item.quantity < 1);
    if (hasInvalid) {
      setFormError('Each line item needs a name, a valid price, and quantity of at least 1.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('invoices').insert({
      user_id: user?.id,
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim(),
      line_items: lineItems,
      subtotal,
      tax_rate: taxRateNum,
      tax_amount: taxAmount,
      total,
      status: sendNow ? 'sent' : 'draft',
      notes: notes.trim(),
    });
    setSaving(false);
    if (error) {
      setFormError('Could not save the invoice. Please try again.');
      return;
    }
    await fetchInvoices();
    const saved = invoices[0];
    const url = saved ? `${window.location.origin}/#invoice/${saved.token}` : '';
    if (sendNow) {
      const subject = encodeURIComponent(`Invoice from MRI Network — ${clientName.trim()}`);
      const body = encodeURIComponent(
        `Hi ${clientName.trim()},\n\nYou have a new invoice from Morales Royal Industries.\n\nTotal: ${total.toFixed(2)}\n\nView and pay your invoice here:\n${url}\n\nThank you for your business!`,
      );
      window.open(`mailto:${clientEmail.trim()}?subject=${subject}&body=${body}`, '_blank');
      setLastSent({ name: clientName.trim(), email: clientEmail.trim(), url });
    }
    resetForm();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
    if (!error) setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, status: newStatus as Invoice['status'] } : inv)));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) setInvoices(invoices.filter((inv) => inv.id !== id));
  };

  const copyLink = (invoice: Invoice) => {
    const url = `${window.location.origin}/#invoice/${invoice.token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(invoice.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const sendEmail = (invoice: Invoice) => {
    const url = `${window.location.origin}/#invoice/${invoice.token}`;
    const subject = encodeURIComponent(`Invoice from MRI Network — ${invoice.client_name}`);
    const body = encodeURIComponent(
      `Hi ${invoice.client_name},\n\nYou have a new invoice from Morales Royal Industries.\n\nTotal: $${Number(invoice.total).toFixed(2)}\n\nView and pay your invoice here:\n${url}\n\nThank you for your business!`,
    );
    window.open(`mailto:${invoice.client_email}?subject=${subject}&body=${body}`, '_blank');
  };

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return inv.client_name.toLowerCase().includes(q) || inv.client_email.toLowerCase().includes(q) || inv.status.toLowerCase().includes(q);
  });

  const formatCurrency = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="dash-grid dash-grid-invoices">
      <section className="dash-panel generator-panel invoice-builder">
        <div className="panel-head">
          <h2><Plus size={18} /> New Invoice</h2>
          <p>Select products and send a proposal to your client.</p>
        </div>

        <form className="generator-form" onSubmit={(e) => handleSave(e, false)}>
          <div className="form-row">
            <label>
              <span>Client name</span>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Acme Corp" />
            </label>
            <label>
              <span>Client email</span>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" />
            </label>
          </div>
          <label>
            <span>Client phone (optional)</span>
            <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          </label>

          <div className="invoice-catalog">
            <span className="invoice-catalog-label">Add a product or service</span>
            <div className="invoice-catalog-grid">
              {CATALOG.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="invoice-catalog-item"
                  onClick={() => addCatalogItem(item)}
                >
                  <span className="invoice-catalog-name">{item.name}</span>
                  {item.price > 0 && <span className="invoice-catalog-price">{formatCurrency(item.price)}</span>}
                </button>
              ))}
            </div>
          </div>

          {lineItems.length > 0 && (
            <div className="invoice-line-items">
              <span className="invoice-line-label">Line items</span>
              {lineItems.map((item, index) => (
                <div className="invoice-line-row" key={index}>
                  <div className="invoice-line-info">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                      placeholder="Item name"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description (optional)"
                    />
                  </div>
                  <div className="invoice-line-qty">
                    <label>
                      <span>Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </label>
                  </div>
                  <div className="invoice-line-price">
                    <label>
                      <span>Price ($)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateLineItem(index, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                      />
                    </label>
                  </div>
                  <span className="invoice-line-total">{formatCurrency(item.total)}</span>
                  <button
                    type="button"
                    className="invoice-line-remove"
                    onClick={() => removeLineItem(index)}
                    aria-label="Remove item"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="invoice-totals">
            <label className="invoice-tax-field">
              <span>Tax rate (%)</span>
              <input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </label>
            <div className="invoice-totals-summary">
              <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              <div><span>Tax ({taxRateNum}%)</span><strong>{formatCurrency(taxAmount)}</strong></div>
              <div className="invoice-total-row"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            </div>
          </div>

          <label>
            <span>Notes for client (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a message or payment terms…" rows={2} />
          </label>

          {formError && <p className="form-error">{formError}</p>}

          {lastSent && (
            <div className="invoice-sent-confirm">
              <div className="invoice-sent-confirm-icon"><Check size={18} /></div>
              <div className="invoice-sent-confirm-body">
                <strong>Invoice saved & email opened</strong>
                <p>Your email app should have opened with a message to {lastSent.email}. If it didn't, copy this link and send it to your client:</p>
                <div className="invoice-sent-link">
                  <input readOnly value={lastSent.url} />
                  <button type="button" onClick={() => { navigator.clipboard.writeText(lastSent.url); setCopiedId('sent'); setTimeout(() => setCopiedId(null), 2000); }}>
                    {copiedId === 'sent' ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <button type="button" className="invoice-sent-close" onClick={() => setLastSent(null)} aria-label="Dismiss"><XIcon size={16} /></button>
            </div>
          )}

          <div className="invoice-form-actions">
            <button type="submit" className="button button-ghost" disabled={saving}>
              Save draft
            </button>
            <button type="button" className="button button-primary" disabled={saving} onClick={(e) => handleSave(e as unknown as React.FormEvent, true)}>
              {saving ? 'Saving…' : <><Send size={16} /> Save & send</>}
            </button>
          </div>
        </form>
      </section>

      <section className="dash-panel history-panel">
        <div className="panel-head">
          <h2><Receipt size={18} /> Sent invoices</h2>
          <div className="search-box">
            <Search size={15} />
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Receipt size={40} strokeWidth={1} />
            <p>{invoices.length === 0 ? 'No invoices yet. Create your first one.' : 'No results match your search.'}</p>
          </div>
        ) : (
          <div className="invoice-list">
            {filtered.map((invoice) => (
              <div className="invoice-card" key={invoice.id}>
                <div className="invoice-card-header">
                  <div className="invoice-card-info">
                    <h3>{invoice.client_name}</h3>
                    <a className="invoice-card-email" href={`mailto:${invoice.client_email}`}>
                      <Mail size={12} /> {invoice.client_email}
                    </a>
                    <span className="invoice-card-date">{new Date(invoice.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="invoice-card-amount">
                    <strong>{formatCurrency(Number(invoice.total))}</strong>
                    <select
                      className={`status-select ${INVOICE_STATUS_COLORS[invoice.status] ?? ''}`}
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="void">Void</option>
                    </select>
                  </div>
                </div>
                <div className="invoice-card-items">
                  {(invoice.line_items as InvoiceLineItem[]).map((item, i) => (
                    <span key={i} className="invoice-chip">{item.name} ×{item.quantity}</span>
                  ))}
                </div>
                <div className="invoice-card-actions">
                  <button className="invoice-action-btn" onClick={() => copyLink(invoice)}>
                    {copiedId === invoice.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
                  </button>
                  <button className="invoice-action-btn" onClick={() => sendEmail(invoice)}>
                    <Send size={14} /> Email client
                  </button>
                  <button className="invoice-action-btn invoice-action-danger" onClick={() => handleDelete(invoice.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
