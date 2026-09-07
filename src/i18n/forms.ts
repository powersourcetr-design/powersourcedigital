import type { Locale } from './routes'

/**
 * Lead-form strings, both locales.
 *
 * Kept out of `ui.ts` because that file is deliberately chrome-only, and these
 * include validation messages that must read naturally in each language rather
 * than as translated error codes.
 */

export interface FormStrings {
  legend: string
  name: string
  namePlaceholder: string
  phone: string
  /** Sentence before the examples. */
  phoneHint: string
  /** Latin-script examples, each isolated so bidi cannot reorder them. */
  phoneExamples: string[]
  businessType: string
  businessTypes: { value: string; label: string }[]
  budget: string
  budgets: { value: string; label: string }[]
  budgetPick: string
  message: string
  messagePlaceholder: string
  submit: string
  submitting: string
  /** Validation and server errors, shown in the page language. */
  errors: {
    name: string
    phone: string
    businessType: string
    turnstile: string
    network: string
    server: string
    rateLimit: string
  }
  privacy: string
}

/**
 * Business type values are stored in Arabic in both locales, because that is
 * what the brief specified and what the sales team will read in the lead email.
 * Only the visible label changes.
 */
const BUSINESS_TYPES = [
  { value: 'متجر الكتروني', en: 'Online store', ar: 'متجر الكتروني' },
  { value: 'محل أو مطعم', en: 'Shop or restaurant', ar: 'محل أو مطعم' },
  { value: 'شركة', en: 'Company', ar: 'شركة' },
  { value: 'أخرى', en: 'Other', ar: 'أخرى' },
] as const

/** TODO(setup): confirm these bands match your actual pricing — see SETUP.md. */
const BUDGETS = [
  { value: '<5000', en: 'Under 5,000 SAR', ar: 'أقل من 5,000 ريال' },
  { value: '5000-10000', en: '5,000 – 10,000 SAR', ar: '5,000 – 10,000 ريال' },
  { value: '10000-25000', en: '10,000 – 25,000 SAR', ar: '10,000 – 25,000 ريال' },
  { value: '25000+', en: 'Over 25,000 SAR', ar: 'أكثر من 25,000 ريال' },
  { value: 'unsure', en: 'Not sure yet', ar: 'لم أحدد بعد' },
] as const

export const FORM: Record<Locale, FormStrings> = {
  en: {
    legend: 'Request a quote',
    name: 'Your name',
    namePlaceholder: 'Full name',
    phone: 'WhatsApp number',
    phoneHint: 'Saudi number, for example',
    phoneExamples: ['05XXXXXXXX', '+9665XXXXXXXX'],
    businessType: 'Type of business',
    businessTypes: BUSINESS_TYPES.map((t) => ({ value: t.value, label: t.en })),
    budget: 'Budget range',
    budgets: BUDGETS.map((b) => ({ value: b.value, label: b.en })),
    budgetPick: 'Select a range',
    message: 'What do you need?',
    messagePlaceholder: 'A sentence or two is enough.',
    submit: 'Send request',
    submitting: 'Sending…',
    errors: {
      name: 'Please enter your name.',
      phone: 'Enter a Saudi mobile number, starting 05 or +9665.',
      businessType: 'Please choose a business type.',
      turnstile: 'The anti-spam check did not complete. Reload the page and try again.',
      network: 'We could not reach the server. Check your connection, or message us on WhatsApp.',
      server: 'Something went wrong on our side. Please message us on WhatsApp instead.',
      rateLimit: 'Too many requests from this connection. Try again in a few minutes.',
    },
    privacy:
      'We use your details only to reply to this enquiry. We do not sell them or add you to a mailing list.',
  },
  ar: {
    legend: 'اطلب عرض سعر',
    name: 'الاسم',
    namePlaceholder: 'الاسم الكامل',
    phone: 'رقم الواتساب',
    phoneHint: 'رقم سعودي، مثل',
    phoneExamples: ['05XXXXXXXX', '+9665XXXXXXXX'],
    businessType: 'نوع النشاط',
    businessTypes: BUSINESS_TYPES.map((t) => ({ value: t.value, label: t.ar })),
    budget: 'الميزانية التقريبية',
    budgets: BUDGETS.map((b) => ({ value: b.value, label: b.ar })),
    budgetPick: 'اختر النطاق',
    message: 'ما الذي تحتاجه؟',
    messagePlaceholder: 'سطر أو سطران يكفيان.',
    submit: 'أرسل الطلب',
    submitting: 'جارٍ الإرسال…',
    errors: {
      name: 'من فضلك اكتب اسمك.',
      phone: 'اكتب رقم جوال سعودي يبدأ بـ 05 أو ‎+9665.',
      businessType: 'من فضلك اختر نوع النشاط.',
      turnstile: 'لم يكتمل فحص مكافحة الإزعاج. أعد تحميل الصفحة وحاول مرة أخرى.',
      network: 'تعذّر الوصول إلى الخادم. تحقق من اتصالك أو راسلنا على واتساب.',
      server: 'حدث خطأ لدينا. راسلنا على واتساب بدلاً من ذلك.',
      rateLimit: 'طلبات كثيرة من هذا الاتصال. حاول بعد بضع دقائق.',
    },
    privacy: 'نستخدم بياناتك للرد على هذا الطلب فقط. لا نبيعها ولا نضيفك إلى قائمة بريدية.',
  },
}

/**
 * Saudi mobile numbers: nine digits after the country code, always starting 5.
 * Accepts 05XXXXXXXX, 9665XXXXXXXX and +9665XXXXXXXX, ignoring spaces and
 * dashes, because people type all three and rejecting a valid number is the
 * most expensive validation error a lead form can make.
 */
export const SAUDI_MOBILE = /^(?:\+?966|0)5\d{8}$/

export function normaliseSaudiMobile(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, '')
  if (!SAUDI_MOBILE.test(digits)) return null
  const national = digits.replace(/^(?:\+?966|0)/, '')
  return `+966${national}`
}
