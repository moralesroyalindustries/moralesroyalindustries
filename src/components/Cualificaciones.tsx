import { useEffect, useState } from 'react';
import { ArrowRight, Menu, Send, X, Home, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { mountGlobeBackground } from '@/lib/mri-3d-effects';
import CollapsibleDropdown from '@/components/CollapsibleDropdown';
import type { Language } from '@/App';

type Copy = {
  navHome: string;
  navQualification: string;
  heroTitle: string;
  heroBody: string;
  formTitle: string;
  formBody: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phonePlaceholder: string;
  businessName: string;
  businessNamePlaceholder: string;
  services: string;
  businessType: string;
  businessTypeOther: string;
  monthlyRevenue: string;
  revenueGoal: string;
  message: string;
  messagePlaceholder: string;
  consent: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  backHome: string;
  whatsapp: string;
  errorMsg: string;
  required: string;
  emailInvalid: string;
  phoneInvalid: string;
  pageLangLabel: string;
};

const copy: Record<Language, Copy> = {
  es: {
    navHome: 'Inicio',
    navQualification: 'Cualificaciones',
    heroTitle: 'Descubre cómo podemos hacer crecer tu negocio',
    heroBody: 'Completa este formulario de 1 minuto. Analizamos tu negocio y te contactamos con una recomendación a tu medida.',
    formTitle: 'Formulario de evaluación',
    formBody: 'Analizamos tu negocio y te contactamos con una recomendación a tu medida.',
    firstName: 'Nombre *',
    lastName: 'Apellido *',
    email: 'Email *',
    phone: 'Número de teléfono *',
    phonePlaceholder: '787-000-0000',
    businessName: 'Nombre del negocio',
    businessNamePlaceholder: 'Ej. Mi Negocio PR',
    services: '¿Qué servicio te interesa? *',
    businessType: '¿Qué tipo de negocio tienes? *',
    businessTypeOther: 'Especifica tu tipo de negocio *',
    monthlyRevenue: '¿Cuánto genera tu negocio aproximadamente al mes? *',
    revenueGoal: '¿Cuál es tu meta de ingresos mensuales? *',
    message: '¿Algo más que debamos saber?',
    messagePlaceholder: 'Cuéntanos cualquier detalle relevante…',
    consent: 'Acepto que Morales Royal Industries me contacte por teléfono, email o WhatsApp sobre mi solicitud.',
    submit: 'Enviar evaluación',
    submitting: 'Enviando…',
    successTitle: '¡Gracias, {name}! Recibimos tu evaluación. Te contactaremos en menos de 24 horas laborables.',
    successBody: 'Revisaremos tu información y te contactaremos pronto.',
    backHome: 'Volver al inicio',
    whatsapp: 'Escríbenos por WhatsApp',
    errorMsg: 'No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos al 939-366-9024.',
    required: 'Este campo es requerido',
    emailInvalid: 'Email inválido',
    phoneInvalid: 'Número inválido',
    pageLangLabel: 'Idioma',
  },
  en: {
    navHome: 'Home',
    navQualification: 'Qualification',
    heroTitle: 'Discover how we can grow your business',
    heroBody: 'Complete this 1-minute form. We analyze your business and contact you with a tailored recommendation.',
    formTitle: 'Evaluation form',
    formBody: 'We analyze your business and contact you with a tailored recommendation.',
    firstName: 'First name *',
    lastName: 'Last name *',
    email: 'Email *',
    phone: 'Phone number *',
    phonePlaceholder: '787-000-0000',
    businessName: 'Business name',
    businessNamePlaceholder: 'e.g. My Business PR',
    services: 'Which service interests you? *',
    businessType: 'What type of business do you have? *',
    businessTypeOther: 'Specify your business type *',
    monthlyRevenue: 'How much does your business generate per month? *',
    revenueGoal: 'What is your monthly revenue goal? *',
    message: 'Anything else we should know?',
    messagePlaceholder: 'Tell us any relevant details…',
    consent: 'I agree that Morales Royal Industries may contact me by phone, email or WhatsApp about my request.',
    submit: 'Submit evaluation',
    submitting: 'Sending…',
    successTitle: 'Thank you, {name}! We received your evaluation. We will contact you within 24 business hours.',
    successBody: 'We will review your information and reach out soon.',
    backHome: 'Back to home',
    whatsapp: 'Message us on WhatsApp',
    errorMsg: 'We could not send your request. Please try again or contact us at 939-366-9024.',
    required: 'This field is required',
    emailInvalid: 'Invalid email',
    phoneInvalid: 'Invalid number',
    pageLangLabel: 'Language',
  },
};

const serviceOptions = [
  { value: 'website-3d', label: 'Website 3D interactivo' },
  { value: 'website-bookings', label: 'Website con reservas y pagos en línea' },
  { value: 'ad-campaigns', label: 'Campañas de anuncios (Google, Meta e Instagram, ChatGPT Ads)' },
  { value: 'social-media', label: 'Manejo de redes sociales y contenido' },
  { value: 'drone-photo-video', label: 'Drone, foto y video profesional' },
  { value: 'ai-assistant', label: 'Asistente de IA / recepcionista virtual (llamadas, SMS, WhatsApp)' },
  { value: 'custom-software', label: 'Software o app a la medida' },
  { value: 'automation', label: 'Automatización de procesos' },
  { value: 'full-package', label: 'Paquete completo (todo incluido)' },
  { value: 'not-sure', label: 'No estoy seguro, quiero orientación' },
];

const businessTypeOptions = [
  { value: 'salon', label: 'Salón de belleza / Barbería / Spa' },
  { value: 'health', label: 'Salud (médico, dental, terapias)' },
  { value: 'restaurant', label: 'Restaurante / Comida' },
  { value: 'vacation-rental', label: 'Alquiler vacacional / Airbnb / Hotel' },
  { value: 'real-estate', label: 'Bienes raíces' },
  { value: 'professional', label: 'Servicios profesionales (abogados, contables, seguros)' },
  { value: 'construction', label: 'Construcción / Servicios del hogar' },
  { value: 'retail', label: 'Tienda / Retail / E-commerce' },
  { value: 'tourism', label: 'Turismo / Tours' },
  { value: 'other', label: 'Otro' },
];

const revenueOptions = [
  { value: 'starting', label: 'Todavía no genera ingresos / estoy empezando' },
  { value: 'under-2k', label: 'Menos de $2,000' },
  { value: '2k-5k', label: '$2,000 – $5,000' },
  { value: '5k-10k', label: '$5,000 – $10,000' },
  { value: '10k-25k', label: '$10,000 – $25,000' },
  { value: '25k-50k', label: '$25,000 – $50,000' },
  { value: 'over-50k', label: 'Más de $50,000' },
  { value: 'prefer-not', label: 'Prefiero no decir' },
];

const goalOptions = [
  { value: '5k', label: '$5,000 al mes' },
  { value: '10k', label: '$10,000 al mes' },
  { value: '25k', label: '$25,000 al mes' },
  { value: '50k', label: '$50,000 al mes' },
  { value: '100k+', label: '$100,000 o más al mes' },
];

type Errors = Record<string, string>;

export default function Cualificaciones() {
  const [language, setLanguage] = useState<Language>('es');
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [submittedName, setSubmittedName] = useState('');
  const [showOtherField, setShowOtherField] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [businessType, setBusinessType] = useState('');
  const [businessTypeOther, setBusinessTypeOther] = useState('');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [revenueGoal, setRevenueGoal] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    document.title = 'Cualificación de Clientes | Morales Royal Industries';
    const stopGlobe = mountGlobeBackground({ color: 0x2d5ff5, accent: 0xe8b04b });
    return () => { stopGlobe(); };
  }, []);

  useEffect(() => {
    setShowOtherField(businessType === 'other');
  }, [businessType]);

  const t = copy[language];

  const validate = (): boolean => {
    const e: Errors = {};
    if (!firstName.trim()) e.firstName = t.required;
    if (!lastName.trim()) e.lastName = t.required;
    if (!email.trim()) e.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t.emailInvalid;
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) e.phone = t.required;
    else if (digits.length < 10) e.phone = t.phoneInvalid;
    if (services.length === 0) e.services = t.required;
    if (!businessType) e.businessType = t.required;
    if (businessType === 'other' && !businessTypeOther.trim()) e.businessTypeOther = t.required;
    if (!monthlyRevenue) e.monthlyRevenue = t.required;
    if (!revenueGoal) e.revenueGoal = t.required;
    if (!consent) e.consent = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setFormStatus('submitting');

    const servicesLabels = services.map((v) => serviceOptions.find((o) => o.value === v)?.label ?? v);
    const businessTypeLabel = businessTypeOptions.find((o) => o.value === businessType)?.label ?? businessType;

    try {
      const { error: submitError } = await supabase.functions.invoke('send-contact-lead', {
        body: {
          source: 'qualification',
          name: `${firstName} ${lastName}`,
          firstName,
          lastName,
          email,
          phone,
          businessName,
          services: servicesLabels,
          businessType: businessTypeLabel,
          businessTypeOther,
          monthlyRevenue: revenueOptions.find((o) => o.value === monthlyRevenue)?.label ?? monthlyRevenue,
          revenueGoal: goalOptions.find((o) => o.value === revenueGoal)?.label ?? revenueGoal,
          message,
        },
      });

      if (submitError) {
        console.error('Qualification submit error:', submitError);
        setFormStatus('error');
        return;
      }
      setSubmittedName(firstName);
      setFormStatus('success');
    } catch (err) {
      console.error('Qualification submit exception:', err);
      setFormStatus('error');
    }
  };

  return (
    <main className="site-shell">
      <div className="noise" />
      <div className="globe-overlay" />

      <nav className="nav container">
        <a className="brand" href="/" aria-label="Morales Royal Industries home">
          <img src="/images/MRI_NET_LOGO.png" alt="Morales Royal Industries" />
        </a>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="/">{t.navHome}</a>
          <a href="/cualificaciones" className="nav-active">{t.navQualification}</a>
          <a className="nav-cta" href="/#lead-form">{language === 'es' ? 'Empieza a crecer' : 'Start growing'} <ArrowRight size={15} /></a>
        </div>
        <div className="nav-actions">
          <div className="language-switch" aria-label="Language selector">
            <button className={language === 'en' ? 'active' : ''} onClick={() => { setLanguage('en'); setMenuOpen(false); }}>EN</button>
            <span>/</span>
            <button className={language === 'es' ? 'active' : ''} onClick={() => { setLanguage('es'); setMenuOpen(false); }}>ES</button>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      <section className="cual-hero container">
        <div className="cual-hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />{language === 'es' ? 'Evaluación de negocio' : 'Business evaluation'}</div>
          <h1>{t.heroTitle}</h1>
          <p className="cual-hero-body">{t.heroBody}</p>
        </div>
      </section>

      <section className="cual-form-section container">
        <div className="cual-form-card">
          {formStatus === 'success' ? (
            <div className="cual-success">
              <h2>{t.successTitle.replace('{name}', submittedName)}</h2>
              <p>{t.successBody}</p>
              <div className="cual-success-actions">
                <a className="button button-primary" href="/"><Home size={17} />{t.backHome}</a>
                <a className="button button-ghost" href="https://wa.me/19393669024" target="_blank" rel="noopener noreferrer"><MessageSquare size={17} />{t.whatsapp}</a>
              </div>
            </div>
          ) : (
            <>
              <div className="cual-form-header">
                <h2>{t.formTitle}</h2>
                <p>{t.formBody}</p>
              </div>
              <form className="cual-form" onSubmit={handleSubmit} noValidate>
                <input type="text" name="company_website" className="cual-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

                <div className="lead-form-row">
                  <label className="lead-field">
                    <span>{t.firstName}</span>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={language === 'es' ? 'Juan' : 'John'} />
                    {errors.firstName && <span className="cual-field-error">{errors.firstName}</span>}
                  </label>
                  <label className="lead-field">
                    <span>{t.lastName}</span>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={language === 'es' ? 'Pérez' : 'Doe'} />
                    {errors.lastName && <span className="cual-field-error">{errors.lastName}</span>}
                  </label>
                </div>

                <div className="lead-form-row">
                  <label className="lead-field">
                    <span>{t.email}</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    {errors.email && <span className="cual-field-error">{errors.email}</span>}
                  </label>
                  <label className="lead-field">
                    <span>{t.phone}</span>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePlaceholder} />
                    {errors.phone && <span className="cual-field-error">{errors.phone}</span>}
                  </label>
                </div>

                <label className="lead-field">
                  <span>{t.businessName}</span>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={t.businessNamePlaceholder} />
                </label>

                <CollapsibleDropdown
                  label={t.services}
                  options={serviceOptions}
                  multi
                  selected={services}
                  onChange={(v) => { setServices(v as string[]); if (errors.services) setErrors((p) => ({ ...p, services: '' })); }}
                  error={errors.services}
                />

                <CollapsibleDropdown
                  label={t.businessType}
                  options={businessTypeOptions}
                  selected={businessType}
                  onChange={(v) => { setBusinessType(v as string); if (errors.businessType) setErrors((p) => ({ ...p, businessType: '' })); }}
                  error={errors.businessType}
                />

                {showOtherField && (
                  <label className="lead-field">
                    <span>{t.businessTypeOther}</span>
                    <input type="text" value={businessTypeOther} onChange={(e) => setBusinessTypeOther(e.target.value)} />
                    {errors.businessTypeOther && <span className="cual-field-error">{errors.businessTypeOther}</span>}
                  </label>
                )}

                <CollapsibleDropdown
                  label={t.monthlyRevenue}
                  options={revenueOptions}
                  selected={monthlyRevenue}
                  onChange={(v) => { setMonthlyRevenue(v as string); if (errors.monthlyRevenue) setErrors((p) => ({ ...p, monthlyRevenue: '' })); }}
                  error={errors.monthlyRevenue}
                />

                <CollapsibleDropdown
                  label={t.revenueGoal}
                  options={goalOptions}
                  selected={revenueGoal}
                  onChange={(v) => { setRevenueGoal(v as string); if (errors.revenueGoal) setErrors((p) => ({ ...p, revenueGoal: '' })); }}
                  error={errors.revenueGoal}
                />

                <label className="lead-field">
                  <span>{t.message}</span>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 500))} rows={4} placeholder={t.messagePlaceholder} />
                  <span className="cual-char-count">{message.length}/500</span>
                </label>

                <label className="cual-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (errors.consent) setErrors((p) => ({ ...p, consent: '' })); }} />
                  <span>{t.consent}</span>
                </label>
                {errors.consent && <span className="cual-field-error">{errors.consent}</span>}

                <button type="submit" className="button button-primary lead-submit" disabled={formStatus === 'submitting'}>
                  {formStatus === 'submitting' ? t.submitting : <>{t.submit}<Send size={16} /></>}
                </button>

                {formStatus === 'error' && <p className="lead-message lead-error">{t.errorMsg}</p>}
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="footer container">
        <span>Morales Royal Industries — Digital infrastructure for modern growth.</span>
        <span>© 2026 MRI <span className="footer-dot">●</span> Built for momentum.</span>
      </footer>
    </main>
  );
}
