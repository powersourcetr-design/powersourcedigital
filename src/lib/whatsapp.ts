import type { Locale } from '@/i18n/routes'

/** Digits only, no plus sign — the format wa.me expects. */
export const WHATSAPP_NUMBER = '966560654302'

/** Display form, always rendered inside a `dir="ltr"` isolate. */
export const PHONE_DISPLAY = '+966 56 065 4302'
export const PHONE_HREF = 'tel:+966560654302'
export const EMAIL = 'hello@powersourcedigital.com'

/**
 * The message that pre-fills WhatsApp when someone taps the float.
 *
 * A generic "hello" wastes the most valuable moment of the visit: the enquiry
 * arrives with no idea what the person was reading. The message names the page
 * instead, so the reply can start with the answer.
 */
interface Context {
  locale: Locale
  /** The service being read about, if any. */
  service?: string | undefined
  /** The city, on a service-by-city landing page. */
  city?: string | undefined
}

const OPENER: Record<Locale, string> = {
  en: 'Hello, I would like to ask about',
  ar: 'مرحباً، أرغب في الاستفسار عن',
}

const GENERAL: Record<Locale, string> = {
  en: 'Hello, I would like to ask about your services.',
  ar: 'مرحباً، أرغب في الاستفسار عن خدماتكم.',
}

const IN: Record<Locale, string> = { en: 'in', ar: 'في' }

export function whatsappMessage({ locale, service, city }: Context): string {
  if (!service) return GENERAL[locale]

  const subject = city ? `${service} ${IN[locale]} ${city}` : service
  return `${OPENER[locale]} ${subject}${locale === 'ar' ? '.' : '.'}`
}

export function whatsappUrl(context: Context): string {
  const text = encodeURIComponent(whatsappMessage(context))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
