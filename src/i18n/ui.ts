/**
 * Typed UI string dictionary.
 *
 * Every key must exist in every locale — the `satisfies` clause below makes a
 * missing Arabic string a type error, and `t()` throws at build time if a key
 * is ever requested that does not exist. There is no silent fallback to
 * English: a missing translation should stop the build, not ship half-Arabic.
 */

import type { Locale } from './routes'

const en = {
  'nav.home': 'Home',
  'nav.services': 'Services',
  'nav.work': 'Work',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.pricing': 'Pricing',
  'nav.process': 'Process',
  'nav.blog': 'Blog',
  'nav.menu': 'Menu',
  'nav.close': 'Close menu',

  'cta.freeAudit': 'Get a Free Audit',
  'cta.viewServices': 'View Our Services',
  'cta.talkToUs': 'Talk to Us',
  'cta.readMore': 'Read more',

  'contact.phone': 'Phone',
  'contact.whatsapp': 'WhatsApp',
  'contact.email': 'Email',
  'contact.location': 'Riyadh, Saudi Arabia',

  'whatsapp.label': 'Chat on WhatsApp',
  'whatsapp.aria': 'Open a WhatsApp chat with Power Source Digital',

  'a11y.skipToContent': 'Skip to content',
  'a11y.breadcrumb': 'Breadcrumb',
  'a11y.languageSwitcher': 'Change language',
  'a11y.themeToggle': 'Switch between light and dark theme',

  'lang.switchTo': 'العربية',

  'error.404.title': 'Page not found',
  'error.404.body': 'The page you were looking for is not here. It may have moved.',
  'error.404.cta': 'Go to the homepage',
} as const

/** Keys are derived from English, so Arabic cannot go out of sync. */
export type UIKey = keyof typeof en

const ar = {
  'nav.home': 'الرئيسية',
  'nav.services': 'الخدمات',
  'nav.work': 'أعمالنا',
  'nav.about': 'من نحن',
  'nav.contact': 'تواصل معنا',
  'nav.pricing': 'الأسعار',
  'nav.process': 'طريقة العمل',
  'nav.blog': 'المدونة',
  'nav.menu': 'القائمة',
  'nav.close': 'إغلاق القائمة',

  'cta.freeAudit': 'احصل على تدقيق مجاني',
  'cta.viewServices': 'تعرّف على خدماتنا',
  'cta.talkToUs': 'تحدّث إلينا',
  'cta.readMore': 'اقرأ المزيد',

  'contact.phone': 'الهاتف',
  'contact.whatsapp': 'واتساب',
  'contact.email': 'البريد الإلكتروني',
  'contact.location': 'الرياض، المملكة العربية السعودية',

  'whatsapp.label': 'تواصل عبر واتساب',
  'whatsapp.aria': 'ابدأ محادثة واتساب مع مصدر الطاقه ديجيتال',

  'a11y.skipToContent': 'تخطَّ إلى المحتوى',
  'a11y.breadcrumb': 'مسار التنقل',
  'a11y.languageSwitcher': 'تغيير اللغة',
  'a11y.themeToggle': 'التبديل بين الوضع الفاتح والداكن',

  'lang.switchTo': 'English',

  'error.404.title': 'الصفحة غير موجودة',
  'error.404.body': 'الصفحة التي تبحث عنها غير متوفرة هنا، وقد تكون قد نُقلت.',
  'error.404.cta': 'العودة إلى الصفحة الرئيسية',
} as const satisfies Record<UIKey, string>

const DICTIONARY: Record<Locale, Record<UIKey, string>> = { en, ar }

/**
 * Look up a UI string. Throws during the build rather than rendering an empty
 * node, so an untranslated key can never reach production.
 */
export function t(key: UIKey, locale: Locale): string {
  const value = DICTIONARY[locale][key]
  if (!value) {
    throw new Error(`Missing UI string "${key}" for locale "${locale}"`)
  }
  return value
}

/** Curried form, so a page or component resolves its locale once. */
export function useTranslations(locale: Locale) {
  return (key: UIKey): string => t(key, locale)
}
