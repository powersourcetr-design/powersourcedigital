/**
 * Typed UI string dictionary — chrome only.
 *
 * This holds navigation, buttons, labels and accessible names: the furniture
 * that repeats on every page. Page prose does NOT live here. Marketing copy is
 * authored directly in each locale's page file, because the Arabic homepage is
 * written for a Saudi reader rather than translated from the English one, and
 * a key-value dictionary quietly encourages the opposite.
 *
 * Every key must exist in every locale — the `satisfies` clause makes a missing
 * Arabic string a type error, and `t()` throws at build time rather than
 * rendering an empty node. There is no silent fallback to English: a
 * half-Arabic page is a worse outcome than a failed build.
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
  'nav.primary': 'Primary',

  'cta.freeAudit': 'Get a free audit',
  /** Shorter form for the mobile action bar, where space is tight. */
  'cta.freeAuditShort': 'Free audit',
  'cta.viewServices': 'See what we do',
  'cta.talkToUs': 'Talk to us',
  'cta.readMore': 'Read more',
  'cta.learnMore': 'Learn more',
  'cta.call': 'Call',
  'cta.whatsapp': 'WhatsApp',
  'cta.allServices': 'All services',

  'contact.phone': 'Phone',
  'contact.whatsapp': 'WhatsApp',
  'contact.email': 'Email',
  'contact.location': 'Riyadh, Saudi Arabia',

  'footer.about':
    'A digital services company in Riyadh. We build websites, improve how businesses appear on Google, and manage the tools customers use to find and contact them.',
  'footer.services': 'Services',
  'footer.company': 'Company',
  'footer.talk': 'Let’s talk',
  'footer.legal': 'Legal',
  'footer.privacy': 'Privacy policy',
  'footer.terms': 'Terms & conditions',
  'footer.rights': 'All rights reserved.',

  'whatsapp.label': 'Chat on WhatsApp',
  'whatsapp.aria': 'Open a WhatsApp chat with Power Source Digital',

  'a11y.skipToContent': 'Skip to content',
  'a11y.breadcrumb': 'Breadcrumb',
  'a11y.languageSwitcher': 'Change language',
  'a11y.quickActions': 'Quick actions',

  'lang.switchTo': 'العربية',
  'lang.switchToAria': 'اقرأ هذه الصفحة بالعربية',

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
  'nav.primary': 'الرئيسية',

  'cta.freeAudit': 'احصل على تدقيق مجاني',
  'cta.freeAuditShort': 'تدقيق مجاني',
  'cta.viewServices': 'تعرّف على ما نقدمه',
  'cta.talkToUs': 'تحدّث إلينا',
  'cta.readMore': 'اقرأ المزيد',
  'cta.learnMore': 'التفاصيل',
  'cta.call': 'اتصل',
  'cta.whatsapp': 'واتساب',
  'cta.allServices': 'كل الخدمات',

  'contact.phone': 'الهاتف',
  'contact.whatsapp': 'واتساب',
  'contact.email': 'البريد الإلكتروني',
  'contact.location': 'الرياض، المملكة العربية السعودية',

  'footer.about':
    'شركة خدمات رقمية في الرياض. نبني المواقع، ونحسّن طريقة ظهور الشركات على جوجل، وندير الأدوات التي يستخدمها العملاء للوصول إليها.',
  'footer.services': 'الخدمات',
  'footer.company': 'الشركة',
  'footer.talk': 'تواصل معنا',
  'footer.legal': 'قانوني',
  'footer.privacy': 'سياسة الخصوصية',
  'footer.terms': 'الشروط والأحكام',
  'footer.rights': 'جميع الحقوق محفوظة.',

  'whatsapp.label': 'تواصل عبر واتساب',
  'whatsapp.aria': 'ابدأ محادثة واتساب مع مصدر الطاقه ديجيتال',

  'a11y.skipToContent': 'تخطَّ إلى المحتوى',
  'a11y.breadcrumb': 'مسار التنقل',
  'a11y.languageSwitcher': 'تغيير اللغة',
  'a11y.quickActions': 'إجراءات سريعة',

  'lang.switchTo': 'English',
  'lang.switchToAria': 'Read this page in English',

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
