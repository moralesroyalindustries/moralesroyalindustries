import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Globe2,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MonitorPlay,
  MoveUpRight,
  Play,
  Rocket,
  Send,
  ShoppingBag,
  Sparkles,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { supabase, fetchSiteContent, siteImageUrl, type SiteContent, type Invoice, type InvoiceLineItem } from '@/lib/supabase';
import { mountGlobeBackground, mountScrollEffects } from '@/lib/mri-3d-effects';
import { useScrollReveal } from '@/lib/useScrollReveal';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import Cualificaciones from '@/components/Cualificaciones';

export type Language = 'en' | 'es';

export type Copy = {
  nav: { solutions: string; aria: string; process: string; join: string; contact: string; dashboard: string };
  hero: { eyebrow: string; title: string; accent: string; body: string; primary: string; secondary: string; note: string };
  stats: { value: string; label: string }[];
  solutions: { eyebrow: string; title: string; body: string };
  aria: { eyebrow: string; title: string; body: string; cta: string; tag: string };
  process: { eyebrow: string; title: string; body: string; steps: { number: string; title: string; body: string }[] };
  join: {
    eyebrow: string;
    title: string;
    body: string;
    steps: { number: string; title: string; body: string; image: string }[];
    pitch: string;
    cta: string;
    note: string;
  };
  contentCreation: {
    eyebrow: string;
    title: string;
    body: string;
    hint: string;
    cta: string;
    features: string[];
  };
  extras: { eyebrow: string; title: string; hint: string };
  contact: { eyebrow: string; title: string; body: string; cta: string; small: string };
  form: {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    phone: string;
    email: string;
    note: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
  };
  footer: string;
};

export const copy: Record<Language, Copy> = {
  en: {
    nav: { solutions: 'Solutions', aria: 'Aria Assist', process: 'Our method', join: 'Join Our Team', contact: 'Start growing', dashboard: 'Dashboard' },
    hero: {
      eyebrow: 'MRI . MODERN BUSINESS . SMART CAPITAL . GROWTh',
      title: 'Build the business that works\u00a0',
      accent: 'while you grow it.',
      body: 'We create conversion-ready websites, automated systems, software and AI assistants that turn more attention into measurable revenue.',
      primary: 'Explore solutions',
      secondary: 'Talk to our team',
      note: 'Websites • Automation • AI • Growth strategy',
    },
    stats: [
      { value: '24/7', label: 'Systems that keep moving' },
      { value: '01', label: 'Partner for your digital stack' },
      { value: '∞', label: 'Room to scale' },
    ],
    solutions: { eyebrow: 'The growth stack', title: 'Everything your next stage needs.', body: 'Start lean or build the full engine. Each offer is designed to create momentum, clarity and more opportunities to sell.' },
    aria: { eyebrow: 'Powered by Aria Assist', title: 'Your next hire never sleeps.', body: 'Deploy an AI assistant that handles repetitive tasks, responds to leads and keeps your operation moving — so your team can focus on the work that matters.', cta: 'Meet Aria Assist', tag: 'AI workflow intelligence' },
    process: { eyebrow: 'A clearer way forward', title: 'From idea to infrastructure.', body: 'No bloated packages. No confusing handoffs. Just a focused path from what is slowing you down to a system that compounds.', steps: [{ number: '01', title: 'Find the leverage', body: 'We uncover the bottlenecks costing you time, attention and revenue.' }, { number: '02', title: 'Build the system', body: 'We design the experience, tools and automations around your real workflow.' }, { number: '03', title: 'Keep it growing', body: 'You get a smarter digital foundation built to improve with your business.' }] },
    join: {
      eyebrow: 'Become a partner',
      title: 'Become a partner and turn our tools into your income.',
      body: 'Get full access to our suite of digital tools, workflows, systems and more — and use them to build income by serving your own clients. Plus join our community, monthly updates and done-with-you support.',
      steps: [
        { number: '01', title: 'Search for leads', body: 'Use our tools to find and connect with potential clients ready for your services.', image: '/images/finp.png' },
        { number: '02', title: 'Grow your client list', body: 'Build relationships and convert prospects into paying clients with proven workflows.', image: '/images/grow.png' },
        { number: '03', title: 'Watch it grow', body: 'Track your progress and scale your income as your client base expands.', image: '/images/monitor.png' },
        { number: '04', title: 'Access the system', body: 'Enroll as a partner and unlock the full MRI Network suite to start building income today.', image: '/images/MRI_Partner_Subscription_Under_2MB.png' },
      ],
      pitch: 'You bring the drive. We bring the tools, the training and the community. Together we turn ambition into income.',
      cta: 'Access the system',
      note: 'Launch your digital business with our full system behind you.',
    },
    contentCreation: {
      eyebrow: 'Advanced Content Creation',
      title: 'Custom content that adapts to your project.',
      body: 'We craft bespoke visual narratives built around your brand, your industry and your audience. Every piece — from interactive 3D experiences to scroll-driven storytelling — is designed from scratch to communicate your value in a way that static templates simply cannot. Whether you need a cinematic product showcase, an immersive property tour, or a fully animated brand story, we adapt the medium to your message. Our team combines real-time 3D rendering, cinematic lighting, custom shaders, and thoughtful copywriting to produce content that moves people to act. Each project is tailored: the tone, palette, pacing, and interactivity are all calibrated to your goals. The result is content that feels alive, that responds to the viewer, and transforms a passive scroll into an engaging journey.',
      hint: 'Scroll inside the preview below to watch the house build itself — a live example of what your custom content could look like.',
      cta: 'Get a Quote',
      features: ['Custom 3D & interactive scenes', 'Scroll-driven storytelling', 'Cinematic lighting & shaders', 'Tailored to your brand & industry'],
    },
    extras: { eyebrow: 'Extras', title: 'May come in handy', hint: 'Add-ons that pair well with any plan.' },
    contact: { eyebrow: 'Ready when you are', title: 'Let\u2019s make growth feel inevitable.', body: 'Tell us where you want to go. We\u2019ll show you the simplest digital path to get there.', cta: 'Book a growth call', small: 'No pressure. Just a clear next step.' },
    form: {
      eyebrow: 'Let\u2019s talk',
      title: 'Tell us about your project.',
      body: 'Fill out the form below and we\u2019ll get back to you within 24 hours to schedule your growth call.',
      name: 'Full name',
      phone: 'Phone number',
      email: 'Email address',
      note: 'What would you like to talk about?',
      submit: 'Send message',
      submitting: 'Sending\u2026',
      success: 'Thanks! Your message has been sent. We\u2019ll be in touch shortly.',
      error: 'Something went wrong. Please try again or email us directly.',
    },
    footer: 'Morales Royal Industries — Digital infrastructure for modern growth.',
  },
  es: {
    nav: { solutions: 'Soluciones', aria: 'Aria Assist', process: 'Método', join: 'Únete al equipo', contact: 'Empieza a crecer', dashboard: 'Panel' },
    hero: {
      eyebrow: 'Sistemas digitales para negocios ambiciosos',
      title: 'Construye el negocio que funciona',
      accent: ' mientras tú lo haces crecer.',
      body: 'Creamos sitios web que convierten, sistemas automatizados, software y asistentes de IA que transforman atención en ingresos medibles.',
      primary: 'Explorar soluciones',
      secondary: 'Hablar con el equipo',
      note: 'Websites • Automatización • IA • Estrategia de crecimiento',
    },
    stats: [
      { value: '24/7', label: 'Sistemas que siguen avanzando' },
      { value: '01', label: 'Aliado para tu ecosistema digital' },
      { value: '∞', label: 'Espacio para escalar' },
    ],
    solutions: { eyebrow: 'El stack de crecimiento', title: 'Todo lo que tu próxima etapa necesita.', body: 'Comienza con lo esencial o construye el motor completo. Cada oferta está diseñada para crear impulso, claridad y más oportunidades de venta.' },
    aria: { eyebrow: 'Powered by Aria Assist', title: 'Tu próxima contratación nunca duerme.', body: 'Implementa un asistente de IA que atiende tareas repetitivas, responde prospectos y mantiene tu operación en movimiento para que tu equipo se enfoque en lo importante.', cta: 'Conoce Aria Assist', tag: 'Inteligencia para tus workflows' },
    process: { eyebrow: 'Un camino más claro', title: 'De la idea a la infraestructura.', body: 'Sin paquetes inflados ni procesos confusos. Solo un camino enfocado desde lo que te frena hasta un sistema que crece contigo.', steps: [{ number: '01', title: 'Encontramos la palanca', body: 'Detectamos los cuellos de botella que te cuestan tiempo, atención e ingresos.' }, { number: '02', title: 'Construimos el sistema', body: 'Diseñamos la experiencia, herramientas y automatizaciones para tu operación real.' }, { number: '03', title: 'Seguimos creciendo', body: 'Obtienes una base digital más inteligente, preparada para mejorar con tu negocio.' }] },
    join: {
      eyebrow: 'Conviértete en partner',
      title: 'Conviértete en partner y transforma nuestras herramientas en tus ingresos.',
      body: 'Obtén acceso completo a nuestra suite de herramientas digitales, workflows, sistemas y más — y úsalas para generar ingresos sirviendo a tus propios clientes. Además únete a nuestra comunidad, actualizaciones mensuales y soporte hecho contigo.',
      steps: [
        { number: '01', title: 'Busca prospectos', body: 'Usa nuestras herramientas para encontrar y conectar con clientes potenciales listos para tus servicios.', image: '/images/finp.png' },
        { number: '02', title: 'Crece tu lista de clientes', body: 'Construye relaciones y convierte prospectos en clientes con flujos de trabajo probados.', image: '/images/grow.png' },
        { number: '03', title: 'Míralo crecer', body: 'Rastrea tu progreso y escala tus ingresos mientras tu base de clientes se expande.', image: '/images/monitor.png' },
        { number: '04', title: 'Acceder al sistema', body: 'Inscríbete como partner y desbloquea toda la suite de MRI Network para empezar a generar ingresos hoy.', image: '/images/MRI_Partner_Subscription_Under_2MB.png' },
      ],
      pitch: 'Tú pones el impulso. Nosotros ponemos las herramientas, la formación y la comunidad. Juntos convertimos la ambición en ingresos.',
      cta: 'Acceder al sistema',
      note: 'Lanza tu negocio digital con todo nuestro sistema detrás de ti.',
    },
    contentCreation: {
      eyebrow: 'Creación de Contenido Avanzado',
      title: 'Contenido personalizado que se adapta a tu proyecto.',
      body: 'Creamos narrativas visuales hechas a medida alrededor de tu marca, tu industria y tu audiencia. Cada pieza — desde experiencias 3D interactivas hasta narrativa guiada por scroll — se diseña desde cero para comunicar tu valor de una forma que las plantillas estáticas simplemente no pueden. Ya sea que necesites un escaparate cinematográfico de producto, un tour inmersivo de una propiedad, o una historia de marca completamente animada, adaptamos el medio a tu mensaje. Nuestro equipo combina renderizado 3D en tiempo real, iluminación cinematográfica, shaders personalizados y redacción cuidadosa para producir contenido que mueve a las personas a actuar. Cada proyecto se adapta: el tono, la paleta, el ritmo y la interactividad se calibran según tus objetivos. El resultado es contenido que se siente vivo, que responde al espectador, y que transforma un scroll pasivo en un viaje envolvente.',
      hint: 'Desplázate dentro de la vista previa abajo para ver la casa construirse — un ejemplo en vivo de cómo podría verse tu contenido personalizado.',
      cta: 'Solicitar cotización',
      features: ['Escenas 3D e interactivas personalizadas', 'Narrativa guiada por scroll', 'Iluminación cinematográfica y shaders', 'Adaptado a tu marca e industria'],
    },
    extras: { eyebrow: 'Extras', title: 'Puede que te sea útil', hint: 'Complementos que combinan con cualquier plan.' },
    contact: { eyebrow: 'Cuando estés listo', title: 'Hagamos que crecer se sienta inevitable.', body: 'Cuéntanos hacia dónde quieres ir. Te mostraremos el camino digital más simple para llegar.', cta: 'Agendar una llamada', small: 'Sin presión. Solo un siguiente paso claro.' },
    form: {
      eyebrow: 'Hablemos',
      title: 'Cuéntanos sobre tu proyecto.',
      body: 'Completa el formulario y te contactaremos en menos de 24 horas para agendar tu llamada de crecimiento.',
      name: 'Nombre completo',
      phone: 'Número de teléfono',
      email: 'Correo electrónico',
      note: '¿Sobre qué te gustaría hablar?',
      submit: 'Enviar mensaje',
      submitting: 'Enviando…',
      success: '¡Gracias! Tu mensaje ha sido enviado. Te contactaremos pronto.',
      error: 'Algo salió mal. Inténtalo de nuevo o escríbenos directamente.',
    },
    footer: 'Morales Royal Industries — Infraestructura digital para el crecimiento moderno.',
  },
};

export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (typeof base !== 'object' || typeof override !== 'object') return override as T;
  if (Array.isArray(base) && Array.isArray(override)) {
    return Array.from({ length: Math.max(base.length, override.length) }, (_, i) =>
      deepMerge(base[i], (override as unknown[])[i])
    ) as T;
  }
  const result: Record<string, unknown> = {};
  const baseObj = base as Record<string, unknown>;
  const overrideObj = override as Record<string, unknown>;
  for (const key of new Set([...Object.keys(baseObj), ...Object.keys(overrideObj)])) {
    result[key] = key in overrideObj ? deepMerge(baseObj[key], overrideObj[key]) : baseObj[key];
  }
  return result as T;
}

function AINetworkOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const visual = visualRef.current;
    if (!canvas || !visual) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const nodes = Array.from({ length: 105 }, (_, index) => {
      const angle = index * 2.39996;
      const radius = Math.sqrt((index + 0.5) / 105);
      return { angle, radius, phase: index * 0.73 };
    });
    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const resize = () => {
      const bounds = visual.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      const seconds = time / 1000;
      const pointer = pointerRef.current;
      const scrollShift = scrollRef.current * 0.00045;
      const centerX = width * 0.5 + (pointer.active ? pointer.x * 16 : 0);
      const centerY = height * 0.5 + (pointer.active ? pointer.y * 12 : 0) + scrollShift;
      const scale = Math.min(width, height) * 0.42;
      context.clearRect(0, 0, width, height);

      const points = nodes.map((node) => {
        const wave = Math.sin(node.angle * 3 + seconds * 1.2 + node.phase) * 0.08;
        const localRadius = node.radius * (1 + wave) * scale;
        const x = centerX + Math.cos(node.angle + seconds * 0.08) * localRadius;
        const y = centerY + Math.sin(node.angle + seconds * 0.08) * localRadius * 0.92;
        const distance = Math.hypot(x - (centerX + pointer.x * scale * 0.7), y - (centerY + pointer.y * scale * 0.7));
        const energy = pointer.active ? Math.max(0, 1 - distance / (scale * 0.85)) : 0;
        return { x: x + pointer.x * energy * 18, y: y + pointer.y * energy * 18, energy };
      });

      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 1.15);
      glow.addColorStop(0, 'rgba(45, 212, 207, 0.19)');
      glow.addColorStop(0.48, 'rgba(45, 95, 245, 0.10)');
      glow.addColorStop(1, 'rgba(6, 9, 18, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(centerX, centerY, scale * 1.15, 0, Math.PI * 2);
      context.fill();

      context.lineWidth = 0.65;
      for (let index = 0; index < points.length; index += 1) {
        for (let next = index + 1; next < points.length; next += 1) {
          const distance = Math.hypot(points[index].x - points[next].x, points[index].y - points[next].y);
          if (distance < scale * 0.22) {
            context.strokeStyle = `rgba(79, 180, 255, ${Math.max(0.06, 0.22 - distance / scale)})`;
            context.beginPath();
            context.moveTo(points[index].x, points[index].y);
            context.lineTo(points[next].x, points[next].y);
            context.stroke();
          }
        }
      }

      points.forEach((point) => {
        const size = 1.1 + point.energy * 2.5;
        context.fillStyle = point.energy > 0.1 ? '#f5c969' : '#4f9dff';
        context.shadowBlur = point.energy > 0.1 ? 12 : 5;
        context.shadowColor = point.energy > 0.1 ? '#f5c969' : '#2d5ff5';
        context.beginPath();
        context.arc(point.x, point.y, size, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;
      animationFrame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = visual.getBoundingClientRect();
      const px = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
      const py = (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);
      pointerRef.current = { x: px, y: py, active: true };
      if (cursorRef.current) {
        cursorRef.current.style.left = `${event.clientX - bounds.left}px`;
        cursorRef.current.style.top = `${event.clientY - bounds.top}px`;
      }
    };
    const onPointerLeave = () => { pointerRef.current.active = false; };
    const onScroll = () => { scrollRef.current = window.scrollY; };
    const observer = new ResizeObserver(resize);

    observer.observe(visual);
    visual.addEventListener('pointermove', onPointerMove);
    visual.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      visual.removeEventListener('pointermove', onPointerMove);
      visual.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <div ref={visualRef} className="hero-visual" aria-label="Interactive AI network orb" role="img"><canvas ref={canvasRef} /><div ref={cursorRef} className="orb-cursor"><span /></div><div className="signal signal-one"><span>AI</span><small>ONLINE</small></div><div className="signal signal-two"><Workflow size={17} /><span>+42%</span><small>FLOW</small></div><div className="visual-label">M.R.I. / 2026</div></div>;
}

type CheckoutMode = 'payment' | 'subscription';

type Product = {
  icon: typeof Globe2;
  number: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: Record<Language, string>;
  detail: Record<Language, string>;
  priceId: string;
  mode: CheckoutMode;
  featured?: boolean;
};

type Extra = {
  icon: typeof Globe2;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: Record<Language, string>;
  priceId: string;
  mode: CheckoutMode;
};

const products: Product[] = [
  {
    icon: Globe2,
    number: '01',
    name: { en: 'Website Essentials', es: 'Website Essentials' },
    description: {
      en: 'Mobile-first web display for your products or services. Up to 10 images, Google Reviews, contact info and location — built to increase conversions and the perceived value of your brand.',
      es: 'Display web mobile-first para tus productos o servicios. Hasta 10 imágenes, reseñas de Google, contacto y ubicación — diseñado para aumentar conversiones y el valor de tu marca.',
    },
    price: { en: '$347', es: '$347' },
    detail: { en: 'One-time payment', es: 'Pago único' },
    priceId: 'price_1UIK6MAYfoNBkygQsCnlEcxB',
    mode: 'payment',
  },
  {
    icon: Workflow,
    number: '02',
    name: { en: 'Website Advanced System', es: 'Website Advanced System' },
    description: {
      en: 'Advanced map setup, video loops, client conversion system and contact forms. Mobile-first, high-converting site with basic on-page SEO, quote forms, click-to-call and Google Reviews.',
      es: 'Mapas avanzados, videos en loop, sistema de conversión y formularios. Sitio mobile-first que convierte con SEO básico, formularios y reseñas de Google.',
    },
    price: { en: '$597', es: '$597' },
    detail: { en: 'One-time payment', es: 'Pago único' },
    priceId: 'price_1UIVaSAYfoNBkygQ8nsGhKXs',
    mode: 'payment',
    featured: true,
  },
  {
    icon: Rocket,
    number: '03',
    name: { en: 'Ultimate Web System', es: 'Ultimate Web System' },
    description: {
      en: 'E-commerce + payment systems, all Web System + CRM features, weekly optimization + reporting, and AI-powered calls with CRM automation. 12-month agreement.',
      es: 'E-commerce + sistema de pagos, todo el Web System + CRM, optimización semanal + reportes, y llamadas con IA + automatización de CRM. Acuerdo de 12 meses.',
    },
    price: { en: '$4,995', es: '$4,995' },
    detail: { en: 'One-time payment', es: 'Pago único' },
    priceId: 'price_1UIVi6AYfoNBkygQlnT05jSS',
    mode: 'payment',
  },
];

const extras: Extra[] = [
  {
    icon: MessageSquareText,
    name: { en: 'Google Reviews NFC Card', es: 'Google Reviews NFC Card' },
    description: {
      en: 'A smart NFC card that helps businesses collect more customer reviews with a simple tap. Customers place their phone near the card and are instantly directed to your Google review page — no app or QR scanning required.',
      es: 'Una tarjeta NFC inteligente que ayuda a los negocios a recolectar más reseñas con un simple toque. El cliente acerca su teléfono y va directamente a tu página de reseñas en Google.',
    },
    price: { en: '$39', es: '$39' },
    priceId: 'price_1UIVwuAYfoNBkygQYDLlgwZ9',
    mode: 'payment',
  },
  {
    icon: Headphones,
    name: { en: 'Coaching Call', es: 'Coaching Call' },
    description: {
      en: 'Book a 30–40 minute coaching call where we can discuss any doubts and workflows of the platform.',
      es: 'Reserva una llamada de coaching de 30–40 minutos para resolver dudas y revisar workflows.',
    },
    price: { en: '$99', es: '$99' },
    priceId: 'price_1UIfYBAYfoNBkygQB6xZd31e',
    mode: 'payment',
  },
];


function Landing() {
  const [language, setLanguage] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [touchOverlayVisible, setTouchOverlayVisible] = useState(true);
  const [mareaTouchOverlayVisible, setMareaTouchOverlayVisible] = useState(true);
  const [liveContent, setLiveContent] = useState<SiteContent | null>(null);

  useScrollReveal();

  useEffect(() => {
    fetchSiteContent().then(setLiveContent).catch(() => setLiveContent({}));
    const stopGlobe = mountGlobeBackground({ color: 0x2d5ff5, accent: 0xe8b04b });
    const stopFx = mountScrollEffects();
    return () => { stopGlobe(); stopFx(); };
  }, []);

  const t = liveContent ? deepMerge(copy[language], liveContent[language] ?? {}) : copy[language];

  const submitLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setFormStatus('submitting');
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '');
    const phone = String(formData.get('phone') ?? '');
    const email = String(formData.get('email') ?? '');
    const note = String(formData.get('note') ?? '');
    try {
      const { error: submitError } = await supabase.functions.invoke('send-contact-lead', {
        body: { name, phone, email, note },
      });
      if (submitError) {
        console.error('Lead submit error:', submitError);
        setFormStatus('error');
        return;
      }
      form.reset();
      setFormStatus('success');
    } catch (err) {
      console.error('Lead submit exception:', err);
      setFormStatus('error');
    }
  };

  const switchLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setMenuOpen(false);
  };

  const redirectToCheckout = async (priceId: string, mode: CheckoutMode) => {
    setCheckoutLoading(priceId);
    try {
      const origin = window.location.origin;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${origin}/?checkout=success`,
          cancel_url: `${origin}/?checkout=cancel`,
          mode,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        console.error('Checkout error:', data.error);
        setCheckoutLoading(null);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutLoading(null);
    }
  };

  return (
    <main className="site-shell">
      <div className="noise" />
      <div className="globe-overlay" />
      <nav className="nav container">
        <a className="brand" href="#top" aria-label="Morales Royal Industries home">
          <img src="/images/MRI_NET_LOGO.png" alt="Morales Royal Industries" />
        </a>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#solutions" onClick={() => setMenuOpen(false)}>{t.nav.solutions}</a>
          <a href="#aria" onClick={() => setMenuOpen(false)}>{t.nav.aria}</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>{t.nav.process}</a>
          <a href="/cualificaciones" onClick={() => setMenuOpen(false)}>{language === 'es' ? 'Cualificaciones' : 'Qualification'}</a>
          <a href="#join" onClick={() => setMenuOpen(false)}><Users size={14} />{t.nav.join}</a>
          <a className="nav-dashboard" href="#dashboard" onClick={() => setMenuOpen(false)}><LayoutDashboard size={14} />{t.nav.dashboard}</a>
          <a className="nav-cta" href="#lead-form" onClick={() => setMenuOpen(false)}>{t.nav.contact} <ArrowRight size={15} /></a>
        </div>
        <div className="nav-actions">
          <div className="language-switch" aria-label="Language selector">
            <button className={language === 'en' ? 'active' : ''} onClick={() => switchLanguage('en')}>EN</button>
            <span>/</span>
            <button className={language === 'es' ? 'active' : ''} onClick={() => switchLanguage('es')}>ES</button>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      <section id="top" className="hero container">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />{t.hero.eyebrow}</div>
          <h1>{t.hero.title}<em>{t.hero.accent}</em></h1>
          <p className="hero-body">{t.hero.body}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#solutions">{t.hero.primary}<ArrowRight size={17} /></a>
            <a className="button button-ghost" href="#lead-form"><Play size={15} fill="currentColor" />{t.hero.secondary}</a>
          </div>
          <p className="hero-note"><Sparkles size={14} />{t.hero.note}</p>
        </div>
        <AINetworkOrb />
      </section>

      <section className="stats container">
        {t.stats.map((stat, i) => <div className="stat" key={stat.label} data-reveal data-reveal-delay={i * 120}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
      </section>

      <section id="solutions" className="solutions container section-space">
        <div className="section-heading" data-reveal><div><div className="eyebrow"><span className="eyebrow-line" />{t.solutions.eyebrow}</div><h2>{t.solutions.title}</h2></div><p>{t.solutions.body}</p></div>
        <div className="product-grid">
          {products.map((product) => {
            const Icon = product.icon;
            const isLoading = checkoutLoading === product.priceId;
            return (
              <article className={`product-card ${product.featured ? 'featured' : ''}`} key={product.number} data-tilt="up">
                <div className="card-top"><span className="card-number">{product.number}</span><span className="card-icon" data-reveal data-reveal-zoom data-reveal-delay={200}><Icon size={20} /></span></div>
                <div className="product-content"><h3>{product.name[language]}</h3><p>{product.description[language]}</p></div>
                <div className="card-bottom">
                  <div><strong>{product.price[language]}</strong><span>{product.detail[language]}</span></div>
                  <button className="buy-button" onClick={() => redirectToCheckout(product.priceId, product.mode)} disabled={isLoading}>
                    {isLoading ? 'Loading…' : <>Buy now <ShoppingBag size={16} /></>}
                  </button>
                </div>
                {product.featured && <span className="featured-tag">Most requested</span>}
              </article>
            );
          })}
        </div>
      </section>

      <section id="smart-marketing" className="smart-marketing-section container section-space">
        <div className="smart-marketing-card" data-reveal>
          <div className="smart-marketing-media">
            <img src="/Smart-Marketing-Campaign.jpg" alt="Smart Marketing Campaign with AI-powered advertising and campaign monitoring" loading="lazy" />
            <span className="smart-marketing-badge">{language === 'en' ? 'NEW SERVICE' : 'NUEVO SERVICIO'}</span>
          </div>
          <div className="smart-marketing-content">
            <div className="eyebrow"><span className="eyebrow-line" />{language === 'en' ? 'AI-powered growth' : 'Crecimiento impulsado por IA'}</div>
            <h2>Smart Marketing Campaign</h2>
            <p className="smart-marketing-lead">
              {language === 'en'
                ? 'Your customers are searching right now. Are they finding you or your competition? Morales Royal Industries puts your business in front of them.'
                : 'Tus clientes están buscando ahora mismo. ¿Te están encontrando a ti o a tu competencia? Morales Royal Industries pone tu negocio frente a ellos.'}
            </p>
            <details className="smart-marketing-details">
              <summary>
                <span>{language === 'en' ? 'Explore the campaign system' : 'Conoce el sistema de campañas'}</span>
                <ChevronDown size={19} aria-hidden="true" />
              </summary>
              <div className="smart-marketing-details-body">
                <p>{language === 'en' ? 'Marketing has changed. The smartest businesses already have. Modern businesses no longer rely on flyers, guesswork or boosting a post and hoping for the best. They use AI-powered marketing on the platforms where buying decisions happen today, including the newest marketplace: ChatGPT Ads.' : 'El marketing cambió. Los negocios más inteligentes ya se adaptaron. Los negocios modernos ya no dependen de flyers, suposiciones o impulsar una publicación esperando lo mejor. Usan marketing impulsado por IA en las plataformas donde ocurren las decisiones de compra, incluyendo el nuevo marketplace: ChatGPT Ads.'}</p>
                <div className="smart-marketing-points">
                  <article><h3>{language === 'en' ? 'Google Ads: be found by people ready to buy' : 'Google Ads: aparece frente a quienes están listos para comprar'}</h3><p>{language === 'en' ? 'Your business appears at the top of Google when people search for what you offer, in your area and on any device. You reach people who are already looking.' : 'Tu negocio aparece en la parte superior de Google cuando las personas buscan lo que ofreces, en tu área y desde cualquier dispositivo. Llegas a quienes ya están buscando.'}</p></article>
                  <article><h3>{language === 'en' ? 'Meta Ads and ChatGPT Ads: be everywhere your customers are' : 'Meta Ads y ChatGPT Ads: aparece donde están tus clientes'}</h3><p>{language === 'en' ? 'Reach your audience on Facebook, Instagram and ChatGPT with one strategy across three powerful platforms.' : 'Llega a tu audiencia en Facebook, Instagram y ChatGPT con una estrategia integrada en tres plataformas poderosas.'}</p></article>
                  <article><h3>{language === 'en' ? 'The Smart Vigilance System' : 'El Sistema de Vigilancia Inteligente'}</h3><p>{language === 'en' ? 'We monitor campaign performance constantly, move budget to what works, cut what does not and sharpen targeting and copy so your ads get smarter every day.' : 'Monitoreamos el rendimiento constantemente, movemos el presupuesto hacia lo que funciona, eliminamos lo que no y afinamos la segmentación y los textos para que tus anuncios mejoren cada día.'}</p></article>
                  <article><h3>{language === 'en' ? 'Fresh content, every month' : 'Contenido fresco cada mes'}</h3><p>{language === 'en' ? 'Our Marketing Content Subscription keeps your brand ready with professional photos, videos, reels and graphics for your ads, website and social media.' : 'Nuestra Suscripción de Contenido de Marketing mantiene tu marca lista con fotos, videos, reels y gráficos profesionales para tus anuncios, website y redes sociales.'}</p></article>
                </div>
                <div className="smart-marketing-includes">
                  <h3>{language === 'en' ? 'What you get' : 'Lo que recibes'}</h3>
                  <ul>
                    <li><Check size={16} />{language === 'en' ? 'Campaigns on Google Ads, Meta Ads and ChatGPT Ads built around your goals' : 'Campañas en Google Ads, Meta Ads y ChatGPT Ads diseñadas para tus objetivos'}</li>
                    <li><Check size={16} />{language === 'en' ? 'Constant monitoring and optimization with our Smart Vigilance System' : 'Monitoreo y optimización constante con nuestro Sistema de Vigilancia Inteligente'}</li>
                    <li><Check size={16} />{language === 'en' ? 'Clear reports showing what your investment is generating' : 'Reportes claros que muestran lo que genera tu inversión'}</li>
                    <li><Check size={16} />{language === 'en' ? 'Monthly marketing content tailored to your brand' : 'Contenido de marketing mensual adaptado a tu marca'}</li>
                  </ul>
                </div>
                <p className="smart-marketing-close">{language === 'en' ? 'Stop hoping customers find you. Make sure they do.' : 'Deja de esperar que tus clientes te encuentren. Asegúrate de que lo hagan.'}</p>
              </div>
            </details>
            <a className="button button-primary smart-marketing-cta" href="#lead-form">{language === 'en' ? 'Make sure they find you' : 'Haz que te encuentren'} <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <section className="content-creation-section marea-preview-section container section-space">
        <div className="content-creation-grid">
          <div className="content-creation-copy">
            <div className="eyebrow"><span className="eyebrow-line" />{language === 'en' ? 'Resort & Spa Experience' : 'Experiencia Resort & Spa'}</div>
            <h2>{language === 'en' ? '3D Interactive Website' : 'Website 3D Interactivo'}</h2>
            <p className="content-creation-body">{language === 'en' ? 'Marea is an interactive resort concept that transforms as visitors scroll. It shows how a brand can turn a simple page into an atmospheric, story-driven experience.' : 'Marea es un concepto interactivo de resort que se transforma mientras el visitante desliza. Muestra cómo una marca puede convertir una página en una experiencia atmosférica y guiada por una historia.'}</p>
            <div className="content-creation-features">
              <span><Check size={15} />{language === 'en' ? 'Scroll-built 3D environment' : 'Entorno 3D construido con scroll'}</span>
              <span><Check size={15} />{language === 'en' ? 'Cinematic resort storytelling' : 'Narrativa cinematográfica de resort'}</span>
              <span><Check size={15} />{language === 'en' ? 'Responsive interactive preview' : 'Vista previa interactiva responsive'}</span>
            </div>
            <div className="demo-showcase-meta interactive-website-offer">
              <div className="demo-showcase-price">
                <strong>$599</strong>
                <span>{language === 'en' ? 'One-time payment' : 'Pago único'}</span>
              </div>
              <button
                className="button button-primary demo-buy-btn"
                onClick={() => redirectToCheckout('prod_VNKBJffPvXY1Lb', 'payment')}
                disabled={checkoutLoading === 'prod_VNKBJffPvXY1Lb'}
              >
                {checkoutLoading === 'prod_VNKBJffPvXY1Lb'
                  ? 'Loading…'
                  : <>{language === 'en' ? 'Get started' : 'Comenzar'} <ShoppingBag size={18} /></>}
              </button>
            </div>
          </div>
          <div className="content-creation-preview">
            <div
              className="content-creation-preview-frame"
              onPointerEnter={() => setMareaTouchOverlayVisible(false)}
              onPointerLeave={() => setMareaTouchOverlayVisible(true)}
            >
              <span className="demo-live-badge"><MonitorPlay size={14} /> {language === 'en' ? 'Interactive Preview' : 'Vista previa interactiva'}</span>
              <iframe
                src="/MareaD.html"
                title="Marea Resort & Spa — Interactive 3D Preview"
                className="content-creation-iframe"
                loading="lazy"
              />
              <div className={`content-creation-touch-overlay ${mareaTouchOverlayVisible ? '' : 'hidden'}`}>
                <span className="content-creation-touch-text">{language === 'en' ? 'Touch and Scroll' : 'Toca y desliza'}</span>
              </div>
              <div className="content-creation-scroll-hint">
                <span>{language === 'en' ? 'Scroll inside the preview to explore the resort' : 'Desliza dentro de la vista previa para explorar el resort'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="real-estate-section container section-space">
        <div className="real-estate-content">
          <div className="drone-flyover" aria-label="Drone photography service" role="img">
            <div className="drone-propeller drone-propeller-left" />
            <div className="drone-propeller drone-propeller-right" />
            <div className="drone-arm drone-arm-left" />
            <div className="drone-arm drone-arm-right" />
            <div className="drone-body"><span className="drone-camera" /></div>
            <span className="drone-label">{language === 'en' ? 'Drone aerial content' : 'Contenido aéreo con drone'}</span>
          </div>
          <div className="real-estate-copy">
            <div className="eyebrow"><span className="eyebrow-line" />Real Estate</div>
            <h2>Advanced Photo to Video Content Creation and Drone Service</h2>
            <p>Turn property photography into cinematic video content that captures attention and helps listings stand out. Or contact us for filming profesional drone footage.</p>
            <a className="button button-primary" href="#lead-form">Create your content <ArrowRight size={17} /></a>
          </div>
          <div className="real-estate-video-wrap">
            <video
              className="real-estate-video"
              src="/images/BLUEVID.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              preload="metadata"
              aria-label="Real estate photo to video content creation preview"
            />
            <span className="demo-live-badge"><MonitorPlay size={14} /> Photo to Video</span>
          </div>
        </div>
      </section>

      <section id="aria" className="aria-section container">
        <div className="aria-grid">
          <div className="aria-visual" data-reveal data-reveal-slide="left">
            <div className="aria-grid-lines" />
            <div className="aria-orbit orbit-a" />
            <div className="aria-orbit orbit-b" />
            <div className="aria-orbit orbit-c" />
            <div className="aria-scan-line" />
            <div className="aria-avatar">
              <span className="aria-avatar-glow" />
              <img src="/Project_Aria_logo_vector.png" alt="Aria Assist" />
            </div>
            <span className="aria-code code-a">010 / 101 / 001</span>
            <span className="aria-code code-b">ARIA_ASSIST.ON</span>
            <span className="aria-status"><i /> SYSTEM READY</span>
          </div>
          <div className="aria-copy" data-reveal data-reveal-slide="right" data-reveal-delay={150}>
            <div className="aria-brand-lockup">
              <span className="eyebrow-line" />
              <img src="/Power_By_Aria_Assist.png" alt="Powered by Aria Assist" />
            </div>
            <h2>{t.aria.title}</h2>
            <p>{t.aria.body}</p>
            <div className="aria-features">
              <span><Check size={15} />Lead response</span>
              <span><Check size={15} />Task automation</span>
              <span><Check size={15} />CRM connection</span>
            </div>
            <a className="button button-light" href="#lead-form">{t.aria.cta}<ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <section id="process" className="process container section-space">
        <div className="section-heading" data-reveal><div><div className="eyebrow"><span className="eyebrow-line" />{t.process.eyebrow}</div><h2>{t.process.title}</h2></div><p>{t.process.body}</p></div>
        <div className="steps">{t.process.steps.map((step, i) => <div className="step" key={step.number} data-tilt="up" data-reveal data-reveal-delay={i * 120}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></div>)}</div>
      </section>

      <section id="join" className="join-section container section-space">
        <div className="join-intro" data-reveal>
          <div className="eyebrow"><span className="eyebrow-line" />{t.join.eyebrow}</div>
          <h2>{t.join.title}</h2>
          <p className="join-body">{t.join.body}</p>
        </div>
        <div className="join-walk-wrap">
          <div className="join-grid-2x2">
            {t.join.steps.map((step, stepIdx) => {
              const imgOverride = (t.join as Record<string, unknown>)[`step${stepIdx + 1}_image`];
              const imgSrc = (typeof imgOverride === 'string' && imgOverride) ? imgOverride : siteImageUrl(step.image);
              return (
              <div className="join-demo-step" key={step.number} data-tilt>
                <div className="join-demo-media">
                  <img src={imgSrc} alt={step.title} loading="lazy" />
                  <span className="join-demo-number">{step.number}</span>
                </div>
                <div className="join-demo-copy">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
              );
            })}
          </div>
          <svg className="join-walk-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="walk-path" d="M25,10 L25,42 L75,42 L75,54 L25,54 L25,90 L50,90" />
            <circle className="walk-dot" r="1.2" />
          </svg>
          <div className="join-cta">
            <a
              className="button button-primary join-enroll"
              href="https://mrinetworkpr.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.join.cta}<ArrowRight size={18} />
            </a>
            <span className="join-note">{t.join.note}</span>
          </div>
        </div>
        <p className="join-pitch"><Sparkles size={16} />{t.join.pitch}</p>
      </section>

      <section id="extras" className="extras-section container section-space">
        <div className="section-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" />{t.extras.eyebrow}</div>
            <h2>{t.extras.title}</h2>
          </div>
          <p>{t.extras.hint}</p>
        </div>
        <div className="extras-grid" data-reveal data-reveal-delay={100}>
          {extras.map((extra) => {
            const Icon = extra.icon;
            const isLoading = checkoutLoading === extra.priceId;
            return (
              <article className="extra-card" key={extra.priceId} data-tilt>
                <div className="extra-top">
                  <span className="card-icon"><Icon size={20} /></span>
                  <MoveUpRight size={18} className="extra-arrow" />
                </div>
                <div className="product-content">
                  <h3>{extra.name[language]}</h3>
                  <p>{extra.description[language]}</p>
                </div>
                <div className="card-bottom">
                  <div><strong>{extra.price[language]}</strong></div>
                  <button className="buy-button" onClick={() => redirectToCheckout(extra.priceId, extra.mode)} disabled={isLoading}>
                    {isLoading ? 'Loading…' : <>Buy now <ShoppingBag size={16} /></>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="contact" className="contact container">
        <div className="contact-inner" data-reveal data-reveal-zoom>
          <div>
            <div className="eyebrow"><span className="eyebrow-line" />{t.contact.eyebrow}</div>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.body}</p>
          </div>
          <div className="contact-action">
            <a className="button button-primary" href="#lead-form">{t.contact.cta}<ArrowRight size={17} /></a>
            <span>{t.contact.small}</span>
          </div>
        </div>
      </section>

      <section id="lead-form" className="lead-form-section container section-space">
        <div className="lead-form-card" data-reveal data-reveal-zoom>
          <div className="lead-form-header">
            <div className="eyebrow"><span className="eyebrow-line" />{t.form.eyebrow}</div>
            <h2>{t.form.title}</h2>
            <p>{t.form.body}</p>
          </div>
          <form className="lead-form" onSubmit={submitLead}>
            <div className="lead-form-row">
              <label className="lead-field">
                <span>{t.form.name}</span>
                <input type="text" name="name" required placeholder="John Doe" />
              </label>
              <label className="lead-field">
                <span>{t.form.phone}</span>
                <input type="tel" name="phone" required placeholder="+1 (555) 000-0000" />
              </label>
            </div>
            <label className="lead-field">
              <span>{t.form.email}</span>
              <input type="email" name="email" required placeholder="you@example.com" />
            </label>
            <label className="lead-field">
              <span>{t.form.note}</span>
              <textarea name="note" required rows={4} placeholder="I'd like to talk about…" />
            </label>
            <button type="submit" className="button button-primary lead-submit" disabled={formStatus === 'submitting'}>
              {formStatus === 'submitting' ? t.form.submitting : <>{t.form.submit}<Send size={16} /></>}
            </button>
            {formStatus === 'success' && <p className="lead-message lead-success"><Check size={16} />{t.form.success}</p>}
            {formStatus === 'error' && <p className="lead-message lead-error">{t.form.error}</p>}
          </form>
        </div>
      </section>

      <footer className="footer container">
        <span>{t.footer}</span>
        <span>© 2026 MRI <span className="footer-dot">●</span> Built for momentum.</span>
      </footer>
    </main>
  );
}

function PublicInvoice({ token }: { token: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('token', token)
        .maybeSingle();
      if (fetchError || !data) {
        setError(true);
        setLoading(false);
        return;
      }
      setInvoice(data as unknown as Invoice);
      setLoading(false);
    })();
    return () => controller.abort();
  }, [token]);

  const formatCurrency = (n: number) => `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return <div className="loading-screen"><div className="noise" /><p>Loading invoice…</p></div>;
  }
  if (error || !invoice) {
    return (
      <div className="invoice-public">
        <div className="invoice-public-card">
          <h1>Invoice not found</h1>
          <p>This invoice may have been deleted or the link is invalid.</p>
          <a className="button button-primary" href="/">Back to site</a>
        </div>
      </div>
    );
  }

  const items = (invoice.line_items as InvoiceLineItem[]) ?? [];

  return (
    <div className="invoice-public">
      <div className="invoice-public-card">
        <div className="invoice-public-header">
          <div>
            <img src="/images/MRI_NET_LOGO.png" alt="MRI Network" className="invoice-public-logo" />
            <span className="invoice-public-brand">Morales Royal Industries</span>
          </div>
          <div className="invoice-public-meta">
            <span className={`invoice-status-badge invoice-status-${invoice.status}`}>{invoice.status}</span>
            <span className="invoice-public-date">{new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="invoice-public-billto">
          <span className="invoice-public-section-label">Billed to</span>
          <strong>{invoice.client_name}</strong>
          {invoice.client_email && <a href={`mailto:${invoice.client_email}`}>{invoice.client_email}</a>}
          {invoice.client_phone && <span>{invoice.client_phone}</span>}
        </div>

        <div className="invoice-public-items">
          <div className="invoice-public-items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          {items.map((item, i) => (
            <div className="invoice-public-item-row" key={i}>
              <div>
                <strong>{item.name}</strong>
                {item.description && <p>{item.description}</p>}
              </div>
              <span>{item.quantity}</span>
              <span>{formatCurrency(Number(item.price))}</span>
              <span>{formatCurrency(Number(item.total))}</span>
            </div>
          ))}
        </div>

        <div className="invoice-public-totals">
          <div><span>Subtotal</span><strong>{formatCurrency(Number(invoice.subtotal))}</strong></div>
          <div><span>Tax ({Number(invoice.tax_rate)}%)</span><strong>{formatCurrency(Number(invoice.tax_amount))}</strong></div>
          <div className="invoice-public-grand-total"><span>Total</span><strong>{formatCurrency(Number(invoice.total))}</strong></div>
        </div>

        {invoice.notes && (
          <div className="invoice-public-notes">
            <span className="invoice-public-section-label">Notes</span>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="invoice-public-footer">
          <p>Thank you for your business!</p>
          <a className="button button-primary" href="/">Visit MRI Network</a>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [hash, setHash] = useState(window.location.hash);
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    const onPopState = () => {
      setPathname(window.location.pathname);
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  if (pathname === '/cualificaciones') {
    return <Cualificaciones />;
  }

  if (hash === '#dashboard') {
    if (loading) return <div className="loading-screen"><div className="noise" /><p>Loading…</p></div>;
    return user ? <Dashboard /> : <Login />;
  }

  if (hash.startsWith('#invoice/')) {
    const token = hash.replace('#invoice/', '');
    return <PublicInvoice token={token} />;
  }

  return <Landing />;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
