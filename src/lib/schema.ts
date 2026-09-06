import { absoluteUrl, LOCALE_TAG, type Locale, SITE } from '@/i18n/routes'
import { CITIES } from '@/i18n/slugs'
import { EMAIL, PHONE_DISPLAY } from '@/lib/whatsapp'

/**
 * Typed JSON-LD builders.
 *
 * Everything here is generated from the same data that renders the page, so a
 * FAQ answer cannot say one thing on screen and another in the markup — which
 * is both a ranking risk and a structured-data policy violation.
 *
 * Deliberately absent: AggregateRating and Review. There are no real reviews
 * to cite yet, and inventing them is a manual-action offence. They go in when
 * genuine reviews exist (see CONTENT-NEEDED.md).
 */

type Json = Record<string, unknown>

const ORG_ID = `${SITE}/#organization`
const SITE_ID = `${SITE}/#website`

const LEGAL_NAME: Record<Locale, string> = {
  en: 'Power Source Digital',
  ar: 'مصدر الطاقه ديجيتال',
}

const DESCRIPTION: Record<Locale, string> = {
  en: 'Website design and development, SEO, Google Business Profile optimisation, graphic design and e-commerce management for businesses in Saudi Arabia.',
  ar: 'تصميم وتطوير المواقع، وتحسين محركات البحث، وتحسين الملف التجاري على جوجل، والتصميم الجرافيكي، وإدارة المتاجر الإلكترونية للشركات في المملكة العربية السعودية.',
}

/** Riyadh is the base of operations; the other cities are served, not sited. */
const BASE_CITY = CITIES.find((city) => city.key === 'riyadh')

export function organization(locale: Locale): Json {
  if (!BASE_CITY) throw new Error('schema: Riyadh must exist in CITIES')

  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: LEGAL_NAME[locale],
    alternateName: locale === 'en' ? LEGAL_NAME.ar : LEGAL_NAME.en,
    url: SITE,
    description: DESCRIPTION[locale],
    email: EMAIL,
    telephone: PHONE_DISPLAY.replace(/\s/g, ''),
    address: {
      '@type': 'PostalAddress',
      addressLocality: BASE_CITY.name[locale],
      addressRegion: BASE_CITY.region[locale],
      addressCountry: 'SA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BASE_CITY.geo.lat,
      longitude: BASE_CITY.geo.lng,
    },
    areaServed: CITIES.map((city) => ({
      '@type': 'City',
      name: city.name[locale],
    })),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: PHONE_DISPLAY.replace(/\s/g, ''),
      email: EMAIL,
      availableLanguage: ['en', 'ar'],
      areaServed: 'SA',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      opens: '09:00',
      closes: '18:00',
    },
    knowsLanguage: ['en', 'ar'],
  }
}

export function website(locale: Locale): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE,
    name: LEGAL_NAME[locale],
    inLanguage: LOCALE_TAG[locale],
    publisher: { '@id': ORG_ID },
  }
}

export interface FaqItem {
  question: string
  answer: string
}

/**
 * Generated from the same array the accordion renders, never hand-duplicated.
 * Returns null for an empty list so a page never emits an empty FAQPage.
 */
export function faqPage(items: readonly FaqItem[]): Json | null {
  if (items.length === 0) return null

  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export interface Crumb {
  name: string
  path: string
}

export function breadcrumbs(items: readonly Crumb[]): Json | null {
  if (items.length < 2) return null

  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function service(options: {
  locale: Locale
  name: string
  description: string
  path: string
}): Json {
  return {
    '@type': 'Service',
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    provider: { '@id': ORG_ID },
    areaServed: CITIES.map((city) => ({ '@type': 'City', name: city.name[options.locale] })),
    availableLanguage: ['en', 'ar'],
  }
}

/** Wraps one or more nodes into a single @graph document. */
export function graph(nodes: readonly (Json | null)[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.filter((node): node is Json => node !== null),
  })
}

/** Convenience for the homepage, which always carries these two. */
export function homepageGraph(locale: Locale, extra: readonly (Json | null)[] = []): string {
  return graph([organization(locale), website(locale), ...extra])
}
