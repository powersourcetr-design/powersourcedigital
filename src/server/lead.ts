/**
 * The lead endpoint, written as a plain `(Request, Env) => Response` so it can
 * be mounted either as a Pages Function or as a Worker route without the logic
 * being duplicated or forked. See `functions/api/lead.ts`.
 *
 * The ordering below is deliberate and is the whole point of the file: the lead
 * is written to KV *before* the email is attempted. Mail providers fail — keys
 * expire, domains fall out of verification, Resend has an outage — and when
 * that happens the enquiry still has to exist somewhere. A form that loses a
 * customer because an API key rotated is worse than a form that does not exist,
 * because nobody notices it is broken.
 */

import { FORM, normaliseSaudiMobile } from '../i18n/forms'
import { href, type Locale, localizedPath } from '../i18n/routes'

/**
 * Minimal shape of the KV binding, declared here rather than pulling in
 * `@cloudflare/workers-types` (~1MB of types for two method signatures).
 */
export interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export interface LeadEnv {
  /** Created in the dashboard. Absent in local dev, and handled. */
  LEADS_KV?: KVNamespace | undefined
  TURNSTILE_SECRET_KEY?: string | undefined
  LEAD_EMAIL_KEY?: string | undefined
  LEAD_EMAIL_TO?: string | undefined
  LEAD_EMAIL_FROM?: string | undefined
}

/** Bodies larger than this are not a lead, they are an attack or a mistake. */
const MAX_BODY_BYTES = 32 * 1024

const LIMITS = { name: 100, message: 2000, source: 80 } as const

/**
 * Five submissions per IP per ten minutes.
 *
 * KV is eventually consistent, so a determined attacker with a fast connection
 * can exceed this. It is sized to stop a stuck retry loop and a casual flood,
 * which is what actually happens, and Turnstile is the real bot control.
 */
const RATE_LIMIT = { max: 5, windowSeconds: 600 } as const

const VALID_BUSINESS_TYPES = new Set(FORM.en.businessTypes.map((type) => type.value))
const VALID_BUDGETS = new Set(FORM.en.budgets.map((band) => band.value))

interface Lead {
  id: string
  receivedAt: string
  locale: Locale
  source: string
  name: string
  phone: string
  businessType: string
  budget: string
  message: string
  country: string
  userAgent: string
  referer: string
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value
}

async function isRateLimited(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `rl:${ip}`
  const seen = Number((await kv.get(key)) ?? '0')
  if (seen >= RATE_LIMIT.max) return true
  await kv.put(key, String(seen + 1), { expirationTtl: RATE_LIMIT.windowSeconds })
  return false
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) return false

  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    })
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    // A network failure talking to Turnstile is our problem, not the visitor's.
    // Failing open here is deliberate: the alternative is rejecting real
    // enquiries whenever Cloudflare's verification endpoint is slow.
    return true
  }
}

/** Plain text rather than HTML, so it renders in any client and never trips a spam filter. */
function emailBody(lead: Lead): string {
  const lines = [
    `Name:      ${lead.name}`,
    `WhatsApp:  ${lead.phone}`,
    `Business:  ${lead.businessType}`,
    `Budget:    ${lead.budget || '—'}`,
    `Language:  ${lead.locale}`,
    `Page:      ${lead.source}`,
    `Country:   ${lead.country || '—'}`,
    '',
    'Message:',
    lead.message || '(none)',
    '',
    '—',
    `Reference: ${lead.id}`,
    `Received:  ${lead.receivedAt}`,
  ]
  return lines.join('\n')
}

async function sendEmail(lead: Lead, env: LeadEnv): Promise<boolean> {
  const key = env.LEAD_EMAIL_KEY
  const to = env.LEAD_EMAIL_TO
  const from = env.LEAD_EMAIL_FROM

  if (!key || !to || !from) return false

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New enquiry — ${lead.name} (${lead.source})`,
        text: emailBody(lead),
      }),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * A self-contained error page for visitors without JavaScript.
 *
 * They cannot see the inline field errors, so the response has to carry the
 * message itself — in their language, with WhatsApp as the way out.
 */
function errorPage(locale: Locale, message: string, status: number): Response {
  const copy = FORM[locale]
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const back = locale === 'ar' ? 'العودة' : 'Go back'
  const html = `<!doctype html>
<html lang="${locale === 'ar' ? 'ar-SA' : 'en'}" dir="${dir}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${copy.legend}</title>
<style>body{font-family:system-ui,sans-serif;margin:0;display:grid;place-items:center;min-block-size:100vh;padding:2rem;color:#131a2b}p{max-inline-size:40ch;line-height:1.6}</style>
<div><p>${message}</p><p><a href="javascript:history.back()">${back}</a></p></div>
</html>`

  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function handleLead(request: Request, env: LeadEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } })
  }

  const size = Number(request.headers.get('content-length') ?? '0')
  if (size > MAX_BODY_BYTES) return new Response('Payload too large', { status: 413 })

  // A native form navigation asks for HTML; the fetch() path does not. That is
  // the only reliable way to tell the two apart, and it decides whether the
  // response is a redirect or JSON.
  const wantsHtml = (request.headers.get('accept') ?? '').includes('text/html')
  const ip = request.headers.get('cf-connecting-ip') ?? ''

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const field = (key: string): string => String(form.get(key) ?? '').trim()

  const locale: Locale = field('locale') === 'ar' ? 'ar' : 'en'
  const copy = FORM[locale]

  const fail = (message: string, status: number): Response =>
    wantsHtml
      ? errorPage(locale, message, status)
      : Response.json({ ok: false, error: message }, { status })

  // Honeypot. Answer exactly as we would on success: a bot that learns which
  // field gave it away simply stops filling that field in.
  if (field('company')) {
    return wantsHtml
      ? Response.redirect(
          new URL(href(localizedPath('thankYou', locale)), request.url).toString(),
          303,
        )
      : Response.json({ ok: true })
  }

  if (env.LEADS_KV && ip && (await isRateLimited(env.LEADS_KV, ip))) {
    return fail(copy.errors.rateLimit, 429)
  }

  // Skipped when no secret is configured, so the form keeps working before the
  // keys are added. Documented in SETUP.md as the thing to fix first: until it
  // is set, Turnstile is decoration.
  if (env.TURNSTILE_SECRET_KEY) {
    const token = field('cf-turnstile-response')
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) {
      return fail(copy.errors.turnstile, 400)
    }
  }

  const name = clamp(field('name'), LIMITS.name)
  if (!name) return fail(copy.errors.name, 400)

  const phone = normaliseSaudiMobile(field('phone'))
  if (!phone) return fail(copy.errors.phone, 400)

  const businessType = field('businessType')
  if (!VALID_BUSINESS_TYPES.has(businessType)) return fail(copy.errors.businessType, 400)

  const budgetInput = field('budget')
  const budget = VALID_BUDGETS.has(budgetInput) ? budgetInput : ''

  const lead: Lead = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    locale,
    source: clamp(field('source'), LIMITS.source) || 'unknown',
    name,
    phone,
    businessType,
    budget,
    message: clamp(field('message'), LIMITS.message),
    country: request.headers.get('cf-ipcountry') ?? '',
    userAgent: clamp(request.headers.get('user-agent') ?? '', 200),
    referer: clamp(request.headers.get('referer') ?? '', 200),
  }

  // Storage first, mail second — see the note at the top of this file.
  let stored = false
  if (env.LEADS_KV) {
    try {
      await env.LEADS_KV.put(`lead:${lead.receivedAt}:${lead.id}`, JSON.stringify(lead))
      stored = true
    } catch {
      stored = false
    }
  }

  const emailed = await sendEmail(lead, env)

  // Only a lead that reached neither KV nor an inbox is genuinely lost. That is
  // the one case the visitor must be told about, because the WhatsApp fallback
  // is then the only way their enquiry survives.
  if (!stored && !emailed) return fail(copy.errors.server, 500)

  if (wantsHtml) {
    const thanks = new URL(href(localizedPath('thankYou', locale)), request.url)
    return Response.redirect(thanks.toString(), 303)
  }

  return Response.json({ ok: true, id: lead.id })
}
