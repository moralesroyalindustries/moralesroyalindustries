import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
// Sender domain: moralesroyalindustries.com — must be verified in Resend before sending.

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const { name, phone, email, note } = body;

    if (!name || typeof name !== 'string') return jsonResponse({ error: 'Name is required' }, 400);
    if (!phone || typeof phone !== 'string') return jsonResponse({ error: 'Phone is required' }, 400);
    if (!email || typeof email !== 'string') return jsonResponse({ error: 'Email is required' }, 400);

    const source = typeof body.source === 'string' ? body.source : 'homepage';

    if (source === 'qualification') {
      const {
        firstName,
        lastName,
        businessName,
        services,
        businessType,
        businessTypeOther,
        monthlyRevenue,
        revenueGoal,
        message,
      } = body;

      if (!firstName || typeof firstName !== 'string') return jsonResponse({ error: 'First name is required' }, 400);
      if (!lastName || typeof lastName !== 'string') return jsonResponse({ error: 'Last name is required' }, 400);

      const fullName = `${firstName} ${lastName}`;
      const servicesText = Array.isArray(services) ? services.join(', ') : String(services ?? '');
      const businessTypeText = businessType === 'Otro' && businessTypeOther
        ? `Otro: ${businessTypeOther}`
        : String(businessType ?? '');

      const { error: insertError } = await supabase.from('contact_leads').insert({
        name: fullName,
        phone,
        email,
        note: message || '',
      });

      if (insertError) {
        console.error('Failed to save lead:', insertError);
        return jsonResponse({ error: 'Failed to save your message' }, 500);
      }

      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.error('RESEND_API_KEY is not configured');
        return jsonResponse({ error: 'Email service is not configured' }, 503);
      }

      const now = new Date();
      const prTime = now.toLocaleString('es-PR', {
        timeZone: 'America/Puerto_Rico',
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const html = `
        <h2>New contact request — Cualificación</h2>
        <p><strong>Nombre y apellido:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Nombre del negocio:</strong> ${escapeHtml(businessName || 'No especificado')}</p>
        <p><strong>Servicio(s) de interés:</strong> ${escapeHtml(servicesText || 'No especificado')}</p>
        <p><strong>Tipo de negocio:</strong> ${escapeHtml(businessTypeText || 'No especificado')}</p>
        <p><strong>Ingreso mensual aproximado:</strong> ${escapeHtml(String(monthlyRevenue || 'No especificado'))}</p>
        <p><strong>Meta mensual:</strong> ${escapeHtml(String(revenueGoal || 'No especificado'))}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escapeHtml(String(message || '')).replace(/\n/g, '<br />')}</p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #eee" />
        <p><strong>Fecha y hora (Puerto Rico):</strong> ${escapeHtml(prTime)}</p>
        <p><strong>Página de origen:</strong> /cualificaciones</p>
      `;

      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Morales Royal Industries <contact@moralesroyalindustries.com>',
          to: ['moralesroyalindustries@gmail.com'],
          reply_to: email,
          subject: `New contact request — Cualificación: ${firstName} ${lastName}`,
          html,
        }),
      });

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text();
        console.error('Failed to send lead email:', resendError);
        return jsonResponse({ error: 'Message saved, but email could not be sent' }, 502);
      }

      return jsonResponse({ success: true });
    }

    if (!note || typeof note !== 'string') return jsonResponse({ error: 'Note is required' }, 400);

    const { error: insertError } = await supabase.from('contact_leads').insert({
      name,
      phone,
      email,
      note,
    });

    if (insertError) {
      console.error('Failed to save lead:', insertError);
      return jsonResponse({ error: 'Failed to save your message' }, 500);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      return jsonResponse({ error: 'Email service is not configured' }, 503);
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Morales Royal Industries <contact@moralesroyalindustries.com>',
        to: ['moralesroyalindustries@gmail.com'],
        reply_to: email,
        subject: `New contact request from ${name}`,
        html: `
          <h2>New contact request</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(note).replace(/\n/g, '<br />')}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error('Failed to send lead email:', resendError);
      return jsonResponse({ error: 'Message saved, but email could not be sent' }, 502);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Contact lead error:', error);
    return jsonResponse({ error: 'Unable to process your message' }, 500);
  }
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character);
}
