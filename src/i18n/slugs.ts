/**
 * Localized slug data for every generated route family.
 *
 * English service slugs MUST match the URLs already live on the WordPress
 * site — see docs/legacy-urls.md. Changing one here silently breaks a live
 * URL, so scripts/check-route-parity.mjs asserts them against that file.
 */

import { type Locale, localizedPath, type RouteKey } from './routes'

type L<T extends string = string> = Record<Locale, T>

export interface ServiceDef {
  readonly key: string
  readonly slug: L
  /** Slug fragment used to build the "<service> in <city>" landing pages. */
  readonly cityPattern: L
}

export const SERVICES = [
  {
    key: 'web-design',
    // Live URL — do not change.
    slug: { en: 'website-design-development', ar: 'تصميم-وتطوير-المواقع' },
    cityPattern: { en: 'web-design-in', ar: 'تصميم-مواقع-في' },
  },
  {
    key: 'seo',
    slug: { en: 'seo', ar: 'تحسين-محركات-البحث' },
    cityPattern: { en: 'seo-services-in', ar: 'تحسين-محركات-البحث-في' },
  },
  {
    key: 'google-business',
    slug: { en: 'google-business-profile-optimization', ar: 'تحسين-الملف-التجاري-على-جوجل' },
    cityPattern: { en: 'google-business-profile-in', ar: 'تحسين-الملف-التجاري-في' },
  },
  {
    key: 'graphic-design',
    slug: { en: 'graphic-design', ar: 'التصميم-الجرافيكي' },
    cityPattern: { en: 'graphic-design-in', ar: 'تصميم-جرافيكي-في' },
  },
  {
    key: 'ecommerce',
    slug: { en: 'e-commerce-management', ar: 'إدارة-المتاجر-الإلكترونية' },
    cityPattern: { en: 'ecommerce-management-in', ar: 'إدارة-متاجر-إلكترونية-في' },
  },
] as const satisfies readonly ServiceDef[]

export type ServiceKey = (typeof SERVICES)[number]['key']

export interface CityDef {
  readonly key: string
  readonly slug: L
  readonly name: L
  /** Decimal degrees, used for LocalBusiness geo on city pages. */
  readonly geo: { readonly lat: number; readonly lng: number }
  readonly region: L
}

export const CITIES = [
  {
    key: 'riyadh',
    slug: { en: 'riyadh', ar: 'الرياض' },
    name: { en: 'Riyadh', ar: 'الرياض' },
    geo: { lat: 24.7136, lng: 46.6753 },
    region: { en: 'Riyadh Province', ar: 'منطقة الرياض' },
  },
  {
    key: 'jeddah',
    slug: { en: 'jeddah', ar: 'جدة' },
    name: { en: 'Jeddah', ar: 'جدة' },
    geo: { lat: 21.4858, lng: 39.1925 },
    region: { en: 'Makkah Province', ar: 'منطقة مكة المكرمة' },
  },
  {
    key: 'taif',
    slug: { en: 'taif', ar: 'الطائف' },
    name: { en: 'Taif', ar: 'الطائف' },
    geo: { lat: 21.2703, lng: 40.4158 },
    region: { en: 'Makkah Province', ar: 'منطقة مكة المكرمة' },
  },
  // "Surrounding areas" — the two that share a metro with a primary city.
  {
    key: 'mecca',
    slug: { en: 'mecca', ar: 'مكة-المكرمة' },
    name: { en: 'Mecca', ar: 'مكة المكرمة' },
    geo: { lat: 21.3891, lng: 39.8579 },
    region: { en: 'Makkah Province', ar: 'منطقة مكة المكرمة' },
  },
  {
    key: 'al-kharj',
    slug: { en: 'al-kharj', ar: 'الخرج' },
    name: { en: 'Al Kharj', ar: 'الخرج' },
    geo: { lat: 24.1483, lng: 47.305 },
    region: { en: 'Riyadh Province', ar: 'منطقة الرياض' },
  },
] as const satisfies readonly CityDef[]

export type CityKey = (typeof CITIES)[number]['key']

export const INDUSTRIES = [
  { key: 'restaurants', slug: { en: 'restaurants-and-cafes', ar: 'المطاعم-والمقاهي' } },
  { key: 'contractors', slug: { en: 'contractors-and-mep', ar: 'المقاولات-والكهروميكانيك' } },
  { key: 'clinics', slug: { en: 'clinics-and-dental', ar: 'العيادات-وطب-الأسنان' } },
  { key: 'retail', slug: { en: 'retail-and-ecommerce', ar: 'التجزئة-والتجارة-الإلكترونية' } },
  { key: 'real-estate', slug: { en: 'real-estate', ar: 'العقارات' } },
  { key: 'industrial', slug: { en: 'industrial-and-electrical', ar: 'الصناعة-والكهرباء' } },
] as const

export type IndustryKey = (typeof INDUSTRIES)[number]['key']

export const COMPARISONS = [
  {
    key: 'wordpress-vs-shopify',
    slug: { en: 'wordpress-vs-shopify-saudi-arabia', ar: 'ووردبريس-أم-شوبيفاي-في-السعودية' },
  },
  { key: 'salla-vs-shopify', slug: { en: 'salla-vs-shopify', ar: 'سلة-أم-شوبيفاي' } },
  {
    key: 'wix-vs-wordpress',
    slug: { en: 'wix-vs-wordpress-for-small-business', ar: 'ويكس-أم-ووردبريس-للشركات-الصغيرة' },
  },
] as const

export type ComparisonKey = (typeof COMPARISONS)[number]['key']

export const TOOLS = [
  { key: 'cost-calculator', slug: { en: 'website-cost-calculator', ar: 'حاسبة-تكلفة-الموقع' } },
  {
    key: 'gbp-checker',
    slug: { en: 'google-business-profile-checker', ar: 'فحص-الملف-التجاري-على-جوجل' },
  },
] as const

export type ToolKey = (typeof TOOLS)[number]['key']

/* -------------------------------------------------------------------------- */
/*  Lookups and path builders                                                  */
/* -------------------------------------------------------------------------- */

function byKey<T extends { key: string }>(list: readonly T[], label: string) {
  return (key: string): T => {
    const found = list.find((item) => item.key === key)
    if (!found) throw new Error(`Unknown ${label} key: "${key}"`)
    return found
  }
}

export const getService = byKey(SERVICES, 'service')
export const getCity = byKey(CITIES, 'city')
export const getIndustry = byKey(INDUSTRIES, 'industry')
export const getComparison = byKey(COMPARISONS, 'comparison')
export const getTool = byKey(TOOLS, 'tool')

/** /services/seo/ and /ar/الخدمات/تحسين-محركات-البحث/ */
export function servicePath(key: ServiceKey, locale: Locale): string {
  return localizedPath('serviceDetail', locale, getService(key).slug[locale])
}

/** /seo-services-in-riyadh/ and /ar/تحسين-محركات-البحث-في-الرياض/ */
export function cityServiceSlug(service: ServiceKey, city: CityKey, locale: Locale): string {
  return `${getService(service).cityPattern[locale]}-${getCity(city).slug[locale]}`
}

export function cityServicePath(service: ServiceKey, city: CityKey, locale: Locale): string {
  return localizedPath('cityService', locale, cityServiceSlug(service, city, locale))
}

export function industryPath(key: IndustryKey, locale: Locale): string {
  return localizedPath('industryDetail', locale, getIndustry(key).slug[locale])
}

export function comparisonPath(key: ComparisonKey, locale: Locale): string {
  return localizedPath('comparison', locale, getComparison(key).slug[locale])
}

export function toolPath(key: ToolKey, locale: Locale): string {
  return localizedPath('toolDetail', locale, getTool(key).slug[locale])
}

/** Both locales' slugs for one entity, ready to hand to alternates(). */
export function slugPair(slug: L): Record<Locale, string> {
  return { en: slug.en, ar: slug.ar }
}

/** Route keys whose pages are generated from the data above. */
export const GENERATED_FAMILIES: readonly RouteKey[] = [
  'serviceDetail',
  'cityService',
  'industryDetail',
  'comparison',
]
