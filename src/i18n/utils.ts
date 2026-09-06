/**
 * Locale helpers shared by layouts, pages and the language switcher.
 */

import { DEFAULT_LOCALE, DIR, LOCALES, type Locale } from './routes'

/** Read the locale from a URL pathname. `/ar/...` is Arabic, everything else English. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0]
  return LOCALES.includes(first as Locale) && first !== DEFAULT_LOCALE
    ? (first as Locale)
    : DEFAULT_LOCALE
}

export function isRTL(locale: Locale): boolean {
  return DIR[locale] === 'rtl'
}

/**
 * Format a number for display. Both locales use Western Arabic numerals
 * (0-9), which is what Saudi business sites use in practice; `ar-SA` would
 * otherwise render Eastern Arabic numerals (٠-٩).
 */
export function formatNumber(value: number, locale: Locale): string {
  const tag = locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US'
  return new Intl.NumberFormat(tag).format(value)
}

export function formatDate(value: Date, locale: Locale): string {
  const tag = locale === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-GB'
  return new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(value)
}
